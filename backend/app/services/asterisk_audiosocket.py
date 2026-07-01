import asyncio
import json
import logging
import re
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from app.core.config import settings
from app.services.llm_service import LLMService
from app.services.stt_service import (
    STTService,
    EVT_SPEECH_STARTED,
    EVT_INTERIM,
    EVT_FINAL,
    EVT_SPEECH_FINAL,
    EVT_UTTERANCE_END,
    EVT_ERROR
)
from app.services.tts_service import WarmTTSConnection
from app.services.sarvam_tts import WarmSarvamConnection
from app.services.tts_router import route_tts
from app.utils.audio_conversion import ensure_pcm16_mono_8khz, chunk_pcm_for_telephony
from app.voice_config import voice_cfg

logger = logging.getLogger(__name__)


async def read_packet(reader: asyncio.StreamReader) -> tuple[int, bytes]:
    """
    Reads a framed AudioSocket packet.
    Format: 1-byte message type, 2-byte payload length (big-endian), payload bytes.
    """
    header = await reader.readexactly(3)
    msg_type = header[0]
    payload_len = int.from_bytes(header[1:3], byteorder='big')
    if payload_len > 0:
        payload = await reader.readexactly(payload_len)
    else:
        payload = b''
    return msg_type, payload


def format_packet(msg_type: int, payload: bytes) -> bytes:
    """
    Formats payload into an AudioSocket framed packet.
    """
    payload_len = len(payload)
    header = bytes([msg_type]) + payload_len.to_bytes(2, byteorder='big')
    return header + payload


class AsteriskVoiceSession:
    """
    Handles a single active call session over raw TCP AudioSocket.
    Integrates with STT, LLM, and TTS pipelines.
    """

    def __init__(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
        call_uuid: str,
        context: dict
    ) -> None:
        self.reader = reader
        self.writer = writer
        self.call_uuid = call_uuid
        self.context = context
        self.config = context.get('agent_config') or {}
        self.audio_queue = asyncio.Queue(maxsize=400)
        self.messages = []
        self.llm_tts_task = None
        self.tts_tasks = []
        self.tts_conn = None
        self.sarvam_tts_conn = None
        self.barge_in_event = asyncio.Event()
        self._state = 'idle'
        self.speaking_started_at = 0.0
        self.message_sequence = 0
        self.stt_task = None

    def is_speaking(self) -> bool:
        return self._state == 'speaking'

    def set_state(self, state: str) -> None:
        self._state = state

    def close_from_manager(self, call_uuid: str) -> None:
        """
        Callback triggered by CallSessionManager to close the session from outside.
        """
        logger.info(f'[AsteriskVoiceSession] close_from_manager called for {call_uuid}')
        try:
            self.writer.close()
        except Exception:
            pass

    async def pre_warm_connections(self) -> None:
        """
        Pre-warms the connections to Deepgram/Sarvam TTS servers.
        """
        voice_id = self.config.get('voice_id') or 'aura-asteria-en'
        tts_provider = self.config.get('tts_provider') or 'deepgram'
        language = self.config.get('language') or 'hi-IN'

        routed_provider = route_tts('', tts_provider, language, voice_id)
        if routed_provider == 'sarvam':
            from app.api.v1.voice_ws import _map_sarvam_speaker
            speaker = _map_sarvam_speaker(voice_id, self.config.get('voice_gender'))
            speed = float(self.config.get('voice_speed') or 0.95)
            speed = max(0.5, min(2.0, speed))
            self.sarvam_tts_conn = WarmSarvamConnection(
                api_key=settings.sarvam_api_key or '',
                speaker=speaker,
                language='hi-IN',
                output_audio_codec='pcm',
                pace=speed
            )
            logger.info('[AsteriskVoiceSession] Pre-warming Sarvam TTS WS for telephony...')
            asyncio.create_task(self.sarvam_tts_conn.connect())
            return
        else:
            from app.api.v1.voice_ws import _resolve_deepgram_voice
            dg_voice = _resolve_deepgram_voice(voice_id, self.config.get('voice_gender'))
            self.tts_conn = WarmTTSConnection(
                api_key=settings.deepgram_api_key or '',
                voice_id=dg_voice,
                encoding='linear16',
                sample_rate=8000
            )
            logger.info('[AsteriskVoiceSession] Pre-warming Deepgram TTS WS for telephony (8kHz)...')
            asyncio.create_task(self.tts_conn.connect())
            return

    async def cancel_llm_tts(self) -> None:
        """
        Cancels any ongoing LLM or TTS tasks (Interruption/Barge-in).
        """
        logger.info(f'[AsteriskVoiceSession] Cancelling response tasks for call {self.call_uuid}')
        if self.llm_tts_task and not self.llm_tts_task.done():
            self.llm_tts_task.cancel()
            try:
                await self.llm_tts_task
            except asyncio.CancelledError:
                pass

        for task in self.tts_tasks:
            if not task.done():
                task.cancel()

        self.tts_tasks = []

        if self.tts_conn:
            await self.tts_conn.cancel()

        self._state = 'idle'
        self.speaking_started_at = 0.0

    def _build_system_prompt(self) -> str:
        base = (self.config.get('agent_system_prompt') or self.config.get('system_prompt') or 'You are a helpful voice assistant.').strip()
        kb = (self.config.get('knowledge_base') or '').strip()
        voice_id = self.config.get('voice_id')
        voice_gender = self.config.get('voice_gender')

        from app.utils.post_processor import detect_voice_gender
        if voice_gender:
            gender = voice_gender.lower()
        else:
            gender = detect_voice_gender(voice_id)

        # Determine language (Hinglish/English vs pure Hindi)
        language = (self.config.get('language') or 'en-US').lower()
        is_hindi = language.startswith('hi') or (self.config.get('tts_provider') == 'sarvam')

        from app.api.v1.voice_ws import _get_male_persona_block, _get_female_persona_block
        if '--- Voice Agent Persona ---' in base:
            parts = base.split('--- Voice Agent Persona ---')
            header = parts[0].strip()
            persona_block = _get_male_persona_block() if gender == 'male' else _get_female_persona_block()
            base = f"{header}\n\n{persona_block}"
        else:
            # Fallback override if the block is not structured
            if is_hindi:
                if gender == 'male':
                    base += "\n\nOVERRIDE: आप एक पुरुष (male) भारतीय वॉयस असिस्टेंट हैं। बातचीत में पुल्लिंग हिंदी व्याकरण नियमों का उपयोग करें, जैसे: 'सकता हूँ', 'गया', 'लेता हूँ', 'देता हूँ'। स्त्रीलिंग शब्द या क्रियाओं का उपयोग न करें।"
                else:
                    base += "\n\nOVERRIDE: आप एक महिला (female) भारतीय वॉयस असिस्टेंट हैं। बातचीत में स्त्रीलिंग हिंदी व्याकरण नियमों का उपयोग करें, जैसे: 'सकती हूँ', 'गई', 'लेती हूँ', 'देती हूँ'। पुल्लिंग शब्द या क्रियाओं का उपयोग न करें।"
            else:
                if gender == 'male':
                    base += "\n\nOVERRIDE: You are a male Indian voice assistant. Use male Hinglish grammar rules: 'sakta hoon', 'gaya', 'leta hoon', 'deta hoon'. Do NOT use female phrases."
                else:
                    base += "\n\nOVERRIDE: You are a female Indian voice assistant. Use female Hinglish grammar rules: 'sakti hoon', 'gayi', 'leti hoon', 'deti hoon'. Do NOT use male phrases."

        # Strict prompt instructions based on the selected language
        if is_hindi:
            voice_prefix = (
                "You are a real-time voice assistant on a phone call. You MUST answer in short, natural Hindi (Devanagari script). "
                "Do NOT use Roman Hinglish. Speak and reply using clean, conversational Hindi. "
                "Maximum response length: 1–2 sentences. Avoid long explanations. "
                "Keep replies brief, direct, and conversational."
            )
        else:
            voice_prefix = (
                "You are a real-time voice assistant on a phone call. You MUST answer in short Hinglish. "
                "Maximum response length: 1–2 sentences. Avoid long explanations. "
                "Use natural spoken language. Never generate paragraphs for voice calls. "
                "Keep replies brief, direct, and conversational."
            )

        full = f"{voice_prefix}\n\n{base}"
        if kb:
            full += f"\n\nKnowledge base:\n{kb}"
        return full

    async def trigger_initial_greeting(self) -> None:
        """
        Triggers the initial welcome greeting asynchronously.
        """
        logger.info(f'[AsteriskVoiceSession] Triggering initial greeting for call {self.call_uuid}')
        self.llm_tts_task = asyncio.create_task(
            self.run_llm_tts_pipeline('', is_greeting=True)
        )

    async def send_audio(self, audio_data: bytes) -> None:
        """
        Normalizes and streams audio bytes back to Asterisk via TCP AudioSocket.
        """
        if not audio_data:
            return

        pcm_8k = ensure_pcm16_mono_8khz(audio_data, input_sample_rate=8000)
        chunks = chunk_pcm_for_telephony(pcm_8k)

        for chunk in chunks:
            if self.writer.is_closing():
                break
            packet = format_packet(16, chunk)
            self.writer.write(packet)

        try:
            await self.writer.drain()
        except Exception as e:
            logger.debug(f'Drain failed in send_audio: {e}')

    async def run_llm_tts_pipeline(self, transcript: str, is_greeting: bool = False) -> None:
        """
        Processes the AI pipeline (LLM stream -> Buffer -> TTS -> AudioSocket TCP stream).
        """
        self.set_state('processing')

        if not is_greeting and transcript.strip():
            user_seq = self.message_sequence + 1
            assistant_seq = self.message_sequence + 2
            self.message_sequence = assistant_seq
        else:
            user_seq = None
            assistant_seq = self.message_sequence + 1
            self.message_sequence = assistant_seq

        if not is_greeting and transcript.strip():
            self.messages.append({'role': 'user', 'content': transcript})
            if user_seq:
                try:
                    from app.db.client import get_supabase_client
                    def _insert_user_msg(seq: int):
                        db = get_supabase_client()
                        db.table('call_messages').insert({
                            'call_id': self.call_uuid,
                            'role': 'user',
                            'content': transcript,
                            'sequence_number': seq,
                            'started_at': datetime.now(timezone.utc).isoformat()
                        }).execute()
                    asyncio.create_task(asyncio.to_thread(_insert_user_msg, user_seq))
                except Exception as e:
                    logger.error(f'Failed to log user message: {e}')

        if is_greeting:
            language = self.config.get('language') or 'hi-IN'
            prompt_instruction = 'Generate a short, friendly, conversational welcome greeting for the caller to start the call.'
            if language.lower().startswith('hi'):
                prompt_instruction += ' Speak in Roman Hinglish (mix of Hindi/English).'
            else:
                prompt_instruction += ' Speak in English.'
            compressed_history = [{'role': 'user', 'content': prompt_instruction}]
        else:
            compressed_history = self.messages[-10:]

        token_buffer = ''
        full_response = ''
        chunk_queues = {}
        stream_finished_event = asyncio.Event()
        task_index = 0

        async def playback_worker():
            current_index = 0
            audio_playback_started_marked = False
            while True:
                while current_index not in chunk_queues and not stream_finished_event.is_set():
                    await asyncio.sleep(0.01)

                if current_index not in chunk_queues and stream_finished_event.is_set():
                    break

                queue = chunk_queues[current_index]
                while True:
                    audio_chunk = await queue.get()
                    if audio_chunk is None:
                        break
                    if self.barge_in_event.is_set():
                        continue
                    if not audio_playback_started_marked:
                        audio_playback_started_marked = True
                        self.set_state('speaking')
                        self.speaking_started_at = time.time()
                    await self.send_audio(audio_chunk)

                current_index += 1
            self.set_state('idle')

        async def generate_and_feed(text_to_synth: str, index: int, target_queue: asyncio.Queue) -> None:
            try:
                from app.utils.post_processor import apply_hinglish_post_processing
                v_gender = self.config.get('voice_gender') or self.config.get('voice_id') or 'female'
                text_to_synth = apply_hinglish_post_processing(text_to_synth, v_gender)

                routed_provider = route_tts(
                    text_to_synth,
                    self.config.get('tts_provider'),
                    self.config.get('language'),
                    self.config.get('voice_id')
                )

                if routed_provider == 'sarvam':
                    if self.sarvam_tts_conn is None:
                        from app.api.v1.voice_ws import _map_sarvam_speaker
                        speaker = _map_sarvam_speaker(self.config.get('voice_id'), self.config.get('voice_gender'))
                        speed = float(self.config.get('voice_speed') or 0.95)
                        speed = max(0.5, min(2.0, speed))
                        self.sarvam_tts_conn = WarmSarvamConnection(
                            api_key=settings.sarvam_api_key or '',
                            speaker=speaker,
                            language='hi-IN',
                            output_audio_codec='pcm',
                            pace=speed,
                            sample_rate=8000
                        )
                        await self.sarvam_tts_conn.connect()

                    async for audio_chunk in self.sarvam_tts_conn.speak(text_to_synth):
                        if self.barge_in_event.is_set():
                            break
                        await target_queue.put(audio_chunk)

                else:
                    if self.tts_conn is None:
                        from app.api.v1.voice_ws import _resolve_deepgram_voice
                        dg_voice = _resolve_deepgram_voice(self.config.get('voice_id'), self.config.get('voice_gender'))
                        self.tts_conn = WarmTTSConnection(
                            api_key=settings.deepgram_api_key or '',
                            voice_id=dg_voice,
                            encoding='linear16',
                            sample_rate=8000
                        )
                        await self.tts_conn.connect()

                    async for audio_chunk in self.tts_conn.speak(text_to_synth):
                        if self.barge_in_event.is_set():
                            break
                        await target_queue.put(audio_chunk)

            except Exception as e:
                logger.error(f'TTS Synthesis error for chunk {index}: {e}')
            finally:
                await target_queue.put(None)

        def submit_chunk(text_chunk: str) -> None:
            nonlocal task_index
            if not text_chunk.strip():
                return
            queue = asyncio.Queue()
            chunk_queues[task_index] = queue
            self.tts_tasks.append(
                asyncio.create_task(
                    generate_and_feed(text_chunk.strip(), task_index, queue)
                )
            )
            task_index += 1

        def ends_with_punctuation(w: str) -> bool:
            return len(w) > 0 and w[-1] in ('.', '!', '?', '।')

        def _insert_assist_msg(seq: int):
            db = get_supabase_client()
            db.table('call_messages').insert({
                'call_id': self.call_uuid,
                'role': 'assistant',
                'content': full_response,
                'sequence_number': seq,
                'started_at': datetime.now(timezone.utc).isoformat(),
                'model_used': model
            }).execute()

        playback_task = asyncio.create_task(playback_worker())

        llm = LLMService(
            openai_key=settings.openai_api_key,
            anthropic_key=settings.anthropic_api_key
        )
        model = self.config.get('model') or voice_cfg.OPENAI_VOICE_MODEL

        try:
            llm_stream = llm.generate_stream(
                system_prompt=self._build_system_prompt(),
                messages=compressed_history,
                model=model,
                temperature=0.7,
                max_tokens=voice_cfg.OPENAI_MAX_OUTPUT_TOKENS
            )

            words = []
            is_first_chunk = True

            async for token in llm_stream:
                if self.barge_in_event.is_set():
                    break

                token_buffer += token
                full_response += token

                temp_words = token_buffer.split()
                if not token.endswith(' ') and temp_words:
                    completed_words = temp_words[:-1]
                    token_buffer = temp_words[-1]
                else:
                    completed_words = temp_words
                    token_buffer = ''

                for word in completed_words:
                    words.append(word)
                    limit = (
                        voice_cfg.TTS_CHUNK_FIRST_WORD_MIN
                        if is_first_chunk
                        else voice_cfg.TTS_CHUNK_WORD_MIN
                    )
                    if len(words) >= limit or ends_with_punctuation(word):
                        submit_chunk(' '.join(words))
                        words = []
                        is_first_chunk = False

            if words or token_buffer.strip():
                rem = ' '.join(words)
                if token_buffer.strip():
                    rem = (rem + ' ' + token_buffer.strip()).strip()
                if rem:
                    submit_chunk(rem)

            stream_finished_event.set()
            self.messages.append({'role': 'assistant', 'content': full_response})

            try:
                from app.db.client import get_supabase_client
                asyncio.create_task(asyncio.to_thread(_insert_assist_msg, assistant_seq))
            except Exception as e:
                logger.error(f'Failed to log assistant message: {e}')

            await playback_task

        except asyncio.CancelledError:
            logger.info(f'[AsteriskVoiceSession] Response cancelled for call {self.call_uuid}')
            playback_task.cancel()
        except Exception as e:
            logger.error(f'[AsteriskVoiceSession] Pipeline error: {e}', exc_info=True)
        finally:
            self.barge_in_event.clear()
            self.set_state('idle')

    async def stt_loop(self) -> None:
        """
        Background listener task streaming incoming raw AudioSocket PCM to Deepgram STT.
        """
        stt = STTService(api_key=settings.deepgram_api_key or '')
        language = self.config.get('language') or 'hi-IN'

        try:
            async for event_type, payload in stt.stream_live(
                audio_queue=self.audio_queue,
                language=language,
                endpointing=voice_cfg.STT_ENDPOINTING_MS,
                model=voice_cfg.STT_MODEL,
                encoding='linear16',
                sample_rate='8000'
            ):
                if event_type == EVT_SPEECH_STARTED:
                    continue

                elif event_type in (EVT_INTERIM, EVT_FINAL):
                    transcript = payload.get('transcript', '').strip()
                    if not self.is_speaking():
                        continue
                    if not transcript:
                        continue

                    clean_text = re.sub(r'[^\w\s]', '', transcript).strip()
                    if not clean_text:
                        continue

                    elapsed_speaking = time.time() - self.speaking_started_at
                    if elapsed_speaking > 1.2:
                        logger.info(f'[Barge-In] Interrupting helper speaking for transcript: {transcript}')
                        self.barge_in_event.set()
                        await self.cancel_llm_tts()

                elif event_type == EVT_SPEECH_FINAL:
                    transcript = payload.get('transcript', '').strip()
                    if not transcript:
                        continue
                    logger.info(f"[STT Final] Received final speech: '{transcript}'")
                    await self.cancel_llm_tts()
                    self.llm_tts_task = asyncio.create_task(
                        self.run_llm_tts_pipeline(transcript)
                    )

                elif event_type == EVT_UTTERANCE_END:
                    continue

                elif event_type == EVT_ERROR:
                    logger.error(f'[STT error] {payload}')

        except asyncio.CancelledError:
            return
        except Exception as e:
            logger.error(f'[STT loop exception] {e}', exc_info=True)
            return

    async def run(self) -> None:
        """
        Main runner executing the socket read loop.
        """
        await self.pre_warm_connections()
        await self.trigger_initial_greeting()
        self.stt_task = asyncio.create_task(self.stt_loop())

        try:
            while True:
                msg_type, payload = await read_packet(self.reader)
                if msg_type in (0, 2):
                    logger.info(f'[AudioSocket] Hangup packet received ({msg_type}) for {self.call_uuid}')
                    break
                elif msg_type in (255, 3):
                    logger.error(f'[AudioSocket] Error packet received ({msg_type}) for {self.call_uuid}: {payload}')
                    break
                elif msg_type == 4:
                    continue
                elif msg_type in (16, 1):
                    if len(payload) > 0:
                        try:
                            self.audio_queue.put_nowait(payload)
                        except asyncio.QueueFull:
                            pass
                else:
                    logger.warning(f'[AudioSocket] Unknown packet type {msg_type}')
        except asyncio.IncompleteReadError:
            logger.info(f'[AudioSocket] Connection EOF for {self.call_uuid}')
        except Exception as e:
            logger.error(f'[AudioSocket] Read error: {e}')
        finally:
            await self.cleanup()

    async def cleanup(self) -> None:
        """
        Shutdown hooks clearing active connections and background pipeline tasks.
        """
        logger.info(f'[AsteriskVoiceSession] Performing cleanup for call {self.call_uuid}')
        if self.stt_task and not self.stt_task.done():
            self.stt_task.cancel()
        await self.cancel_llm_tts()
        if self.tts_conn:
            await self.tts_conn.close()
        if self.sarvam_tts_conn:
            await self.sarvam_tts_conn.close()
        try:
            self.audio_queue.put_nowait(None)
        except Exception:
            pass


class AsteriskAudioSocketServer:
    """
    Asynchronous TCP server accepting Asterisk AudioSocket connections.
    """

    def __init__(self, host: str = '127.0.0.1', port: int = 9092) -> None:
        self.host = host
        self.port = port
        self.server = None
        self.active_connections = {}

    async def start(self) -> None:
        self.server = await asyncio.start_server(
            self.handle_connection,
            self.host,
            self.port
        )
        logger.info(f'Asterisk AudioSocket server listening on {self.host}:{self.port}')

    async def handle_connection(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        peer = writer.get_extra_info('peername')
        logger.info(f'[AudioSocket] Inbound connection from {peer}')
        call_uuid = None
        session = None
        try:
            msg_type, payload = await read_packet(reader)
            try:
                import uuid
                if len(payload) == 16:
                    call_uuid = str(uuid.UUID(bytes=payload))
                else:
                    call_uuid = payload.decode('utf-8').strip()
            except Exception:
                logger.error(f'[AudioSocket] Handshake payload decode failed: {payload}')
                writer.close()
                await writer.wait_closed()
                return

            if not call_uuid or len(call_uuid) < 3:
                logger.error(f'[AudioSocket] Handshake payload length is {len(call_uuid)}, invalid UUID/ID: {call_uuid}')
                writer.close()
                await writer.wait_closed()
                return

            logger.info(f'[AudioSocket] Connection authenticated. UUID: {call_uuid}')
            from app.services.call_session_manager import call_session_manager
            context = await call_session_manager.get_call_context(call_uuid)
            if not context:
                logger.error(f'[AudioSocket] Failed to find registered call details for {call_uuid}. Closing connection.')
                writer.close()
                await writer.wait_closed()
                return

            session = AsteriskVoiceSession(reader, writer, call_uuid, context)
            call_session_manager.register_cleanup_callback(call_uuid, session.close_from_manager)
            call_session_manager.start_audio_session(call_uuid)
            self.active_connections[call_uuid] = asyncio.current_task()
            try:
                await session.run()
            except asyncio.CancelledError:
                logger.info(f'[AudioSocket] Client task cancelled for {call_uuid}')
            except Exception as e:
                logger.error(f'[AudioSocket] Connection handler exception for {call_uuid}: {e}', exc_info=True)
        finally:
            if call_uuid:
                self.active_connections.pop(call_uuid, None)
                from app.services.call_session_manager import call_session_manager
                call_session_manager.end_call(call_uuid, 'hangup')
                call_session_manager.cleanup_call(call_uuid)
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass
            logger.info(f"[AudioSocket] Finished connection handler for {call_uuid or 'unknown'}")

    async def stop(self) -> None:
        """
        Gracefully shuts down the TCP server and closes concurrent call loops.
        """
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            logger.info('Asterisk AudioSocket server stopped successfully.')

        for call_uuid, task in list(self.active_connections.items()):
            if not task.done():
                task.cancel()

        self.active_connections.clear()


# Global helper functions referenced in app/main.py

_audiosocket_server: Optional[AsteriskAudioSocketServer] = None

async def start_audiosocket_server(host: str, port: int) -> None:
    global _audiosocket_server
    _audiosocket_server = AsteriskAudioSocketServer(host, port)
    await _audiosocket_server.start()

async def stop_audiosocket_server() -> None:
    global _audiosocket_server
    if _audiosocket_server:
        await _audiosocket_server.stop()
        _audiosocket_server = None

def get_audiosocket_stats() -> dict:
    global _audiosocket_server
    if _audiosocket_server:
        return {
            "status": "running",
            "host": _audiosocket_server.host,
            "port": _audiosocket_server.port,
            "active_connections_count": len(_audiosocket_server.active_connections),
            "active_connections": list(_audiosocket_server.active_connections.keys())
        }
    return {"status": "stopped"}

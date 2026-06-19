import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

# Canonical event names (in chronological order)
USER_SPEECH_STARTED = "user_speech_started"
USER_SPEECH_ENDED = "user_speech_ended"
DEEPGRAM_FIRST_INTERIM = "deepgram_first_interim"
DEEPGRAM_FINAL = "deepgram_final"
LLM_REQUEST_STARTED = "llm_request_started"
LLM_FIRST_TOKEN = "llm_first_token"
FIRST_TTS_CHUNK_SENT = "first_tts_chunk_sent"
SARVAM_FIRST_AUDIO_BYTE = "sarvam_first_audio_byte"
AUDIO_PLAYBACK_STARTED = "audio_playback_started"
AUDIO_PLAYBACK_COMPLETED = "audio_playback_completed"

# Legacy/Compatibility names
AUDIO_RECEIVED = "audio_received_at"
DEEPGRAM_EOT = "deepgram_eot_at"
STT_FINAL = "stt_final_at"
OPENAI_REQUEST_START = "openai_request_start_at"
OPENAI_FIRST_TOKEN = "openai_first_token_at"
DG_TTS_REQUEST = "deepgram_tts_request_at"
DG_TTS_FIRST_BYTE = "deepgram_tts_first_byte_at"
FIRST_AUDIO_PLAYED = "first_audio_played_at"


class LatencyTracker:
    def __init__(self):
        self._origin = time.monotonic()
        self.events: dict[str, float] = {}

    def mark(self, event: str) -> float:
        """Record event and return ms since tracker was created."""
        elapsed = (time.monotonic() - self._origin) * 1000
        self.events[event] = elapsed
        return elapsed

    def has_event(self, event: str) -> bool:
        return event in self.events

    def ms_between(self, start_event: str, end_event: str) -> Optional[float]:
        s = self.events.get(start_event)
        e = self.events.get(end_event)
        if s is None or e is None:
            return None
        return round(e - s, 1)

    def summary(self) -> dict:
        # Calculate metric values
        stt_delay = self.ms_between(USER_SPEECH_ENDED, DEEPGRAM_FINAL)
        llm_first_token_ms = self.ms_between(LLM_REQUEST_STARTED, LLM_FIRST_TOKEN)
        text_to_tts_delay = self.ms_between(LLM_FIRST_TOKEN, FIRST_TTS_CHUNK_SENT)
        tts_first_byte_ms = self.ms_between(FIRST_TTS_CHUNK_SENT, SARVAM_FIRST_AUDIO_BYTE)
        playback_start_delay = self.ms_between(USER_SPEECH_ENDED, AUDIO_PLAYBACK_STARTED)
        total_perceived_latency = self.ms_between(USER_SPEECH_ENDED, AUDIO_PLAYBACK_STARTED)
        
        # Calculate slowest stage
        stages = {}
        if stt_delay is not None:
            stages["STT"] = stt_delay
        if llm_first_token_ms is not None:
            stages["LLM"] = llm_first_token_ms
        if tts_first_byte_ms is not None:
            stages["TTS"] = tts_first_byte_ms
        slowest_stage = max(stages, key=stages.get) if stages else "N/A"

        # Print exactly the requested output block to stdout
        print(f"\n--- LATENCY TURN STATISTICS ---")
        print(f"STT_DELAY_MS = {stt_delay}")
        print(f"LLM_FIRST_TOKEN_MS = {llm_first_token_ms}")
        print(f"TEXT_TO_TTS_DELAY_MS = {text_to_tts_delay}")
        print(f"TTS_FIRST_BYTE_MS = {tts_first_byte_ms}")
        print(f"PLAYBACK_START_DELAY_MS = {playback_start_delay}")
        print(f"TOTAL_PERCEIVED_LATENCY_MS = {total_perceived_latency}")
        print(f"SLOWEST_STAGE = {slowest_stage}")
        print(f"--------------------------------\n")

        # Also log it for file logger
        logger.info(
            "Latency Turn Statistics:\n"
            "  STT_DELAY_MS = %s\n"
            "  LLM_FIRST_TOKEN_MS = %s\n"
            "  TEXT_TO_TTS_DELAY_MS = %s\n"
            "  TTS_FIRST_BYTE_MS = %s\n"
            "  PLAYBACK_START_DELAY_MS = %s\n"
            "  TOTAL_PERCEIVED_LATENCY_MS = %s\n"
            "  SLOWEST_STAGE = %s",
            stt_delay, llm_first_token_ms, text_to_tts_delay,
            tts_first_byte_ms, playback_start_delay, total_perceived_latency, slowest_stage
        )

        # Return backward compatible dict for frontend HUD
        return {
            "stt_eot_ms": stt_delay if stt_delay is not None else 0.0,
            "llm_first_token_ms": llm_first_token_ms if llm_first_token_ms is not None else 0.0,
            "tts_first_byte_ms": tts_first_byte_ms if tts_first_byte_ms is not None else 0.0,
            "total_perceived_ms": total_perceived_latency if total_perceived_latency is not None else 0.0,
            "events": {k: round(v, 1) for k, v in sorted(self.events.items(), key=lambda x: x[1])},
        }

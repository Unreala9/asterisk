import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from app.services.stt_service import STTService
from app.services.llm_service import LLMService
from app.services.tts_service import TTSService
from app.services.telephony_service import TelephonyService
from app.db.client import Client, fetch_agent_with_context

logger = logging.getLogger(__name__)

class CallStatus:
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class CallContext:
    def __init__(self, call_id: str, agent: Dict[str, Any], workspace_id: str):
        self.call_id = call_id
        self.agent = agent
        self.workspace_id = workspace_id
        self.status = CallStatus.CREATED
        self.messages = []

class CallOrchestrator:
    def __init__(
        self, 
        db: Client, 
        stt: STTService, 
        llm: LLMService, 
        tts: TTSService, 
        telephony: TelephonyService
    ):
        self.db = db
        self.stt = stt
        self.llm = llm
        self.tts = tts
        self.telephony = telephony
        self.active_calls: Dict[str, CallContext] = {}

    async def create_call(
        self,
        workspace_id: str,
        agent_id: str,
        phone_number_id: str,
        caller_phone: str,
        twilio_call_sid: str,
        direction: str = "inbound",
        metadata: Dict[str, Any] = None
    ) -> CallContext:
        """Initialize a new call session"""
        
        # 1. Fetch agent config
        agent_data = fetch_agent_with_context(self.db, agent_id)
        if not agent_data:
            raise ValueError(f"Agent {agent_id} not found")
        
        # 2. Create call record in DB
        call_data = {
            "workspace_id": workspace_id,
            "agent_id": agent_id,
            "phone_number_id": phone_number_id,
            "caller_phone_number": caller_phone,
            "twilio_call_sid": twilio_call_sid,
            "direction": direction,
            "status": CallStatus.CREATED,
            "metadata": metadata or {}
        }
        
        db_result = self.db.table("calls").insert(call_data).execute()
        call_id = db_result.data[0]["id"]
        
        # 3. Initialize context
        context = CallContext(call_id, agent_data, workspace_id)
        self.active_calls[call_id] = context
        
        return context

    async def process_audio_input(self, call_id: str, audio_chunk: bytes) -> bytes:
        """Main loop: STT -> LLM -> TTS"""
        context = self.active_calls.get(call_id)
        if not context:
            raise ValueError(f"Call {call_id} context not found")
            
        # 1. Transcribe
        transcript = await self.stt.transcribe(audio_chunk, language=context.agent.get("language", "en-US"))
        if not transcript:
            return b"" # No speech detected
            
        context.messages.append({"role": "user", "content": transcript})
        
        system_prompt = (context.agent.get("agent_system_prompt") or context.agent.get("system_prompt") or "You are a helpful voice assistant. Be concise.").strip()

        # 2. Generate Response
        response_text = await self.llm.generate(
            system_prompt=system_prompt,
            messages=context.messages[-10:], # Last 10 messages for context
            model=context.agent.get("model", "gpt-4-turbo"),
            temperature=float(context.agent.get("temperature", 0.7))
        )
        
        context.messages.append({"role": "assistant", "content": response_text})
        
        # 3. Synthesize
        audio_response = await self.tts.synthesize(
            text=response_text,
            voice_id=context.agent.get("voice_id", "aura-asteria-en")
        )
        
        return audio_response

    async def end_call(self, call_id: str, reason: str = "completed"):
        """Clean up call session"""
        context = self.active_calls.pop(call_id, None)
        if context:
            context.status = CallStatus.COMPLETED if reason == "completed" else CallStatus.FAILED
            
            # Update DB
            self.db.table("calls").update({
                "status": context.status,
                "ended_at": datetime.now().isoformat(),
                "drop_reason": reason
            }).eq("id", call_id).execute()
            
            logger.info(f"Call {call_id} ended. Reason: {reason}")

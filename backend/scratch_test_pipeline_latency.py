import asyncio
import json
import os
import sys
import time
from unittest.mock import MagicMock

import logging
# Configure logging to see connection events
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# Resolve paths
base_dir = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, base_dir)

from app.core.config import settings
from app.api.v1.voice_ws import VoiceSession

class MockWebSocket:
    def __init__(self):
        self.sent_messages = []
        self.sent_bytes = []
        self.url = MagicMock()
        self.url.path = "/ws/voice"

    async def send_json(self, data: dict):
        self.sent_messages.append(data)
        t = data.get("type")
        if t == "latency":
            print(f"  [METRICS] {json.dumps(data)}")
        elif t == "llm_text" or t == "transcript":
            pass
        else:
            print(f"  [CONTROL] {data}")

    async def send_bytes(self, data: bytes):
        self.sent_bytes.append(data)

async def test_session():
    print("Initialising Mock Voice Session...")
    ws = MockWebSocket()
    session = VoiceSession(ws)
    
    # Configure for Sarvam
    session.config = {
        "model": "gpt-4o-mini",
        "language": "hi-IN",
        "voice_id": "shubh",
        "tts_provider": "sarvam",
        "voice_gender": "male"
    }

    # TURN 1: First invocation (will pre-warm, connection completes in background)
    print("\n--- STARTING TURN 1 (Pre-warming + Synthesis) ---")
    start_time = time.time()
    
    # Run the pipeline
    await session.run_llm_tts_pipeline("नमस्ते, आपका स्वागत है। आप कैसे हैं?")
    
    duration = time.time() - start_time
    print(f"Turn 1 completed in {duration:.2f} seconds. Audio packets received: {len(ws.sent_bytes)}")

    # Clear sent bytes for turn 2
    ws.sent_bytes.clear()

    # TURN 2: Second invocation (WebSocket is already warm, zero handshake delay!)
    print("\n--- STARTING TURN 2 (Re-using Warm WebSocket) ---")
    start_time = time.time()
    
    await session.run_llm_tts_pipeline("मैं ठीक हूँ, धन्यवाद। आप क्या कर सकते हैं?")
    
    duration = time.time() - start_time
    print(f"Turn 2 completed in {duration:.2f} seconds. Audio packets received: {len(ws.sent_bytes)}")

    # Clean up
    print("\nClosing session...")
    if session.sarvam_tts_conn:
        await session.sarvam_tts_conn.close()

if __name__ == "__main__":
    # Remove any potential supabase directory path shadowing
    for p in list(sys.path):
        if p.endswith("supabase"):
            sys.path.remove(p)
    asyncio.run(test_session())

import asyncio
import json
import base64
import websockets
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app.core.config import settings

async def main():
    api_key = settings.sarvam_api_key
    if not api_key:
        print("No Sarvam API key found")
        return
        
    url = "wss://api.sarvam.ai/text-to-speech/ws?model=bulbul:v3&send_completion_event=true"
    headers = {
        "api-subscription-key": api_key
    }
    
    try:
        print("Connecting to Sarvam TTS WebSocket...")
        async with websockets.connect(url, additional_headers=headers) as ws:
            print("Connected! Sending config...")
            config_msg = {
                "type": "config",
                "data": {
                    "target_language_code": "hi-IN",
                    "speaker": "shubh",
                    "model": "bulbul:v3",
                    "send_completion_event": True
                }
            }
            await ws.send(json.dumps(config_msg))
            
            print("Sending text payload...")
            text_msg = {
                "type": "text",
                "data": {
                    "text": "नमस्ते, यह एक टेस्ट मैसेज है।"
                }
            }
            await ws.send(json.dumps(text_msg))
            
            # Send flush
            flush_msg = {
                "type": "flush"
            }
            await ws.send(json.dumps(flush_msg))
            
            print("Awaiting response...")
            audio_bytes = b""
            async for raw_msg in ws:
                msg = json.loads(raw_msg)
                msg_type = msg.get("type")
                print(f"Received message type: {msg_type}")
                if msg_type == "audio":
                    audio_b64 = msg.get("data", {}).get("audio", "")
                    audio_bytes += base64.b64decode(audio_b64)
                elif msg_type == "flushed":
                    print("  Flush complete. Exiting...")
                    break
                else:
                    print("Full message:", json.dumps(msg, indent=2))
                    
            print(f"Total audio bytes received: {len(audio_bytes)}")
    except Exception as e:
        print("WebSocket test failed:", e)

if __name__ == "__main__":
    asyncio.run(main())

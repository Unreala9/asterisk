import asyncio
import json
import websockets
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app.core.config import settings

async def test_config(label, codec, sample_rate=None):
    print(f"\n--- Testing: {label} (codec={codec}, sample_rate={sample_rate}) ---")
    url = "wss://api.sarvam.ai/text-to-speech/ws?model=bulbul:v3"
    headers = {"api-subscription-key": settings.sarvam_api_key}
    
    try:
        async with websockets.connect(url, additional_headers=headers) as ws:
            config_msg = {
                "type": "config",
                "data": {
                    "target_language_code": "hi-IN",
                    "speaker": "shubh",
                    "model": "bulbul:v3"
                }
            }
            if codec:
                config_msg["data"]["output_audio_codec"] = codec
            if sample_rate:
                config_msg["data"]["speech_sample_rate"] = sample_rate
                
            await ws.send(json.dumps(config_msg))
            
            # Send text with proper sentence ending
            await ws.send(json.dumps({
                "type": "text",
                "data": {"text": "नमस्ते, यह एक टेस्ट मैसेज है।"}
            }))
            await ws.send(json.dumps({"type": "flush"}))
            
            audio_bytes = b""
            success = False
            
            # Wait for response with a timeout
            try:
                while True:
                    raw_msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    msg = json.loads(raw_msg)
                    msg_type = msg.get("type")
                    if msg_type == "audio":
                        audio_bytes += b"1"
                    elif msg_type == "flushed":
                        print(f"Success! Received {len(audio_bytes)} packets.")
                        success = True
                        break
                    elif msg_type == "error":
                        print(f"Error returned: {msg.get('data', {}).get('message')}")
                        break
            except asyncio.TimeoutError:
                print("HUNG: Timeout after 5 seconds waiting for response.")
                
    except Exception as e:
        print(f"Failed to connect/transmit: {e}")

async def main():
    if not settings.sarvam_api_key:
        print("No API key")
        return
        
    await test_config("Default (no codec/rate)", None, None)
    await test_config("Linear16 explicit", "linear16", 16000)
    await test_config("Linear16 24k", "linear16", 24000)
    await test_config("Mulaw explicit", "mulaw", 8000)

if __name__ == "__main__":
    asyncio.run(main())

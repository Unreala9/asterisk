import asyncio
import websockets
import sys

async def test_connect():
    url = "wss://asterisk.getaipilot.in/ws/voice"
    print(f"Attempting connection to: {url}")
    try:
        async with websockets.connect(url) as ws:
            print("Successfully connected to WebSocket!")
            # Receive initial message (if any)
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                print(f"Received initial message: {msg}")
            except asyncio.TimeoutError:
                print("No initial message received within 5 seconds.")
    except Exception as e:
        print(f"Failed to connect: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connect())

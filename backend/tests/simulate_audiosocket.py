import asyncio
import httpx
import uuid
import sys
import os

# Set Python path to parent directory to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.client import get_supabase_client
from app.core.config import settings

async def main():
    print("--- Asterisk AudioSocket Simulator ---")
    
    # 1. Fetch the first active phone number from the DB to simulate a real call destination
    db = get_supabase_client()
    res = db.table("phone_numbers").select("phone_number, agent_id, workspace_id").limit(1).execute()
    if not res.data:
        print("Error: No phone numbers found in the database. Please add a phone number first.")
        sys.exit(1)
        
    phone_data = res.data[0]
    dialed_number = phone_data["phone_number"]
    agent_id = phone_data["agent_id"]
    workspace_id = phone_data["workspace_id"]
    
    print(f"Using database phone number: {dialed_number} (Agent: {agent_id})")
    
    # 2. Register call via webhook
    call_uuid = str(uuid.uuid4())
    webhook_url = f"http://127.0.0.1:{settings.api_port}/api/webhooks/asterisk/inbound"
    secret = settings.asterisk_webhook_secret or "your_shared_webhook_secret"
    
    payload = {
        "caller_id": "+1234567890",
        "dialed_number": dialed_number,
        "call_uuid": call_uuid,
        "secret": secret
    }
    
    print(f"Registering call via webhook: {webhook_url}...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(webhook_url, json=payload, timeout=5)
            if resp.status_code != 200:
                print(f"Webhook failed with status {resp.status_code}: {resp.text}")
                sys.exit(1)
            print(f"Webhook registration success: {resp.json()}")
        except Exception as e:
            print(f"Failed to connect to FastAPI webhook: {e}")
            sys.exit(1)
            
    # 3. Connect to AudioSocket TCP server
    host = settings.asterisk_audiosocket_host
    port = settings.asterisk_audiosocket_port
    print(f"Connecting to AudioSocket TCP server at {host}:{port}...")
    
    try:
        reader, writer = await asyncio.open_connection(host, port)
    except Exception as e:
        print(f"Failed to connect to AudioSocket server: {e}")
        sys.exit(1)
        
    print("Connected to AudioSocket server!")
    
    # 4. Perform Handshake: send 36-byte UUID as msg_type 1 (payload is raw UUID string)
    handshake_payload = call_uuid.encode('utf-8')
    handshake_header = bytes([1]) + len(handshake_payload).to_bytes(2, byteorder='big')
    handshake_packet = handshake_header + handshake_payload
    
    print(f"Sending handshake packet with UUID: {call_uuid}")
    writer.write(handshake_packet)
    await writer.drain()
    
    # 5. Start receive loop to capture responses (audio/hangup packets)
    async def receive_loop():
        try:
            while True:
                header = await reader.readexactly(3)
                msg_type = header[0]
                payload_len = int.from_bytes(header[1:3], byteorder='big')
                payload = await reader.readexactly(payload_len) if payload_len > 0 else b""
                
                if msg_type == 1:
                    # Received audio
                    print(f"<- Received Audio packet from server: {len(payload)} bytes")
                elif msg_type == 2:
                    print("<- Received Hangup packet from server")
                    break
                elif msg_type == 3:
                    print(f"<- Received Error packet from server: {payload}")
                    break
                else:
                    print(f"<- Received Unknown packet type {msg_type}: {len(payload)} bytes")
        except asyncio.IncompleteReadError:
            print("<- Connection closed by server (EOF)")
        except Exception as e:
            print(f"<- Error in receive loop: {e}")

    rx_task = asyncio.create_task(receive_loop())
    
    # 6. Stream silence to server (type 0x01, length 320, 20ms chunks)
    print("Streaming 3 seconds of silent audio to server...")
    silent_chunk = b'\x00' * 320
    chunk_header = bytes([1]) + (320).to_bytes(2, byteorder='big')
    chunk_packet = chunk_header + silent_chunk
    
    for i in range(150): # 150 * 20ms = 3 seconds
        if writer.is_closing():
            break
        writer.write(chunk_packet)
        await writer.drain()
        await asyncio.sleep(0.02)
        
    print("Sending hangup packet to terminate session...")
    hangup_header = bytes([2]) + (0).to_bytes(2, byteorder='big')
    writer.write(hangup_header)
    await writer.drain()
    
    # Wait for connections to close
    await asyncio.sleep(1)
    writer.close()
    await writer.wait_closed()
    await rx_task
    print("Simulation complete.")

if __name__ == "__main__":
    asyncio.run(main())

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
from app.db.client import get_db, Client
from app.core.config import settings
from app.services.telephony_service import TelephonyService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_telephony() -> TelephonyService:
    if settings.telephony_provider == "telnyx":
        if not settings.telnyx_api_key or not settings.telnyx_account_sid:
            raise HTTPException(status_code=503, detail="Telnyx credentials not configured")
        return TelephonyService(
            account_sid=settings.telnyx_account_sid,
            auth_token_or_api_key=settings.telnyx_api_key,
            provider="telnyx"
        )
    
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        raise HTTPException(status_code=503, detail="Twilio credentials not configured")
    return TelephonyService(
        account_sid=settings.twilio_account_sid,
        auth_token_or_api_key=settings.twilio_auth_token,
        provider="twilio"
    )


@router.get("/{workspace_id}/calls")
async def list_calls(workspace_id: str, db: Client = Depends(get_db)):
    result = db.table("calls").select("*").eq("workspace_id", workspace_id).order("created_at", desc=True).execute()
    return result.data


@router.get("/{workspace_id}/calls/{call_id}")
async def get_call(workspace_id: str, call_id: str, db: Client = Depends(get_db)):
    call_result = db.table("calls").select("*").eq("workspace_id", workspace_id).eq("id", call_id).execute()
    if not call_result.data:
        raise HTTPException(status_code=404, detail="Call not found")
    messages_result = db.table("call_messages").select("*").eq("call_id", call_id).order("sequence_number").execute()
    call_data = call_result.data[0]
    call_data["transcript"] = messages_result.data
    return call_data


def end_asterisk_call(call_id: str) -> bool:
    """Terminates an active Asterisk call by locating its channel and requesting a hangup."""
    import subprocess
    import os
    
    # 1. Fetch active channels
    cmd = ["asterisk", "-rx", "core show channels"]
    stdout = ""
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if res.returncode == 0:
            stdout = res.stdout
        else:
            raise FileNotFoundError()
    except (FileNotFoundError, subprocess.SubprocessError):
        # Run via SSH fallback
        ssh_host = os.getenv("ASTERISK_SSH_HOST") or "72.60.202.148"
        ssh_user = os.getenv("ASTERISK_SSH_USER") or "root"
        ssh_cmd = [
            "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
            f"{ssh_user}@{ssh_host}",
            "asterisk -rx \"core show channels\""
        ]
        try:
            ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
            if ssh_res.returncode == 0:
                stdout = ssh_res.stdout
        except Exception as e:
            logger.error(f"[Asterisk End Call] Failed to query remote channels: {e}")
            return False

    if not stdout:
        return False

    # 2. Search for the channel associated with the call_id (UUID)
    channel_name = None
    for line in stdout.splitlines():
        if call_id in line:
            parts = line.split()
            if parts:
                channel_name = parts[0]
                break

    if not channel_name:
        logger.warning(f"[Asterisk End Call] No active channel found for call_id: {call_id}")
        return False

    # 3. Request hangup for the channel
    logger.info(f"[Asterisk End Call] Found channel {channel_name} for call {call_id}. Requesting hangup...")
    hangup_cmd = ["asterisk", "-rx", f"channel request hangup {channel_name}"]
    try:
        res = subprocess.run(hangup_cmd, capture_output=True, text=True, timeout=10)
        if res.returncode == 0:
            return True
        else:
            raise FileNotFoundError()
    except (FileNotFoundError, subprocess.SubprocessError):
        ssh_host = os.getenv("ASTERISK_SSH_HOST") or "72.60.202.148"
        ssh_user = os.getenv("ASTERISK_SSH_USER") or "root"
        ssh_cmd = [
            "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
            f"{ssh_user}@{ssh_host}",
            f"asterisk -rx \"channel request hangup {channel_name}\""
        ]
        try:
            ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
            if ssh_res.returncode == 0:
                return True
        except Exception as e:
            logger.error(f"[Asterisk End Call] Failed to send remote hangup command: {e}")
            
    return False


@router.post("/{workspace_id}/calls/{call_id}/end")
async def end_active_call(
    workspace_id: str,
    call_id: str,
    db: Client = Depends(get_db),
):
    """Programmatically terminate an active call."""
    call_result = db.table("calls").select("id, twilio_call_sid, status, provider").eq("workspace_id", workspace_id).eq("id", call_id).execute()
    if not call_result.data:
        raise HTTPException(status_code=404, detail="Call not found")
    
    call_data = call_result.data[0]
    call_sid = call_data.get("twilio_call_sid")
    current_status = call_data.get("status")
    provider = call_data.get("provider")
    
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if current_status in ("completed", "failed", "no_answer", "canceled", "busy"):
        return {"status": "already_terminated"}
    
    if provider == "asterisk":
        hangup_success = False
        try:
            hangup_success = end_asterisk_call(call_id)
        except Exception as e:
            logger.error(f"Failed to end Asterisk call: {e}")
            
        try:
            db.table("calls").update({
                "status": "completed",
                "ended_at": now_iso
            }).eq("id", call_id).execute()
        except Exception as db_err:
            logger.error(f"Failed to update call completed status in DB: {db_err}")
            
        return {"status": "terminated" if hangup_success else "terminated_db_only"}
    
    if not call_sid or call_sid == "pending":
        try:
            db.table("calls").update({
                "status": "canceled",
                "ended_at": now_iso
            }).eq("id", call_id).execute()
        except Exception as db_err:
            logger.error(f"Failed to cancel pending call in DB: {db_err}")
        return {"status": "canceled"}
    
    telephony = _get_telephony()
    try:
        telephony.end_call(call_sid)
    except Exception as e:
        logger.error(f"Failed to end call via telephony provider: {e}")
    
    try:
        db.table("calls").update({
            "status": "completed",
            "ended_at": now_iso
        }).eq("id", call_id).execute()
    except Exception as db_err:
        logger.error(f"Failed to update call completed status in DB: {db_err}")
    
    return {"status": "terminated"}


@router.post("/{workspace_id}/agents/{agent_id}/test-call")
async def test_call(
    workspace_id: str,
    agent_id: str,
    body: Dict[str, Any],
    request: Request,
    db: Client = Depends(get_db),
):
    """Place an outbound test call to verify an agent's telephony integration."""
    to_number: str = body.get("to_number", "").strip()
    if not to_number:
        raise HTTPException(status_code=400, detail="to_number is required")

    # Verify agent exists in this workspace
    agent_result = db.table("agents").select("id, name").eq("id", agent_id).eq("workspace_id", workspace_id).execute()
    if not agent_result.data:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Check if the agent has a DID number with provider 'asterisk'
    did_res = db.table("did_numbers").select("id, phone_number, provider, sip_trunk_provider_id").eq("agent_id", agent_id).eq("status", "active").execute()
    
    use_asterisk = False
    from_number = None
    did_number_id = None   # FK to did_numbers table
    trunk_id = None
    
    if did_res.data:
        for did in did_res.data:
            if did.get("provider") == "asterisk":
                use_asterisk = True
                from_number = did.get("phone_number")
                did_number_id = did.get("id")
                trunk_id = did.get("sip_trunk_provider_id")
                break

    if not use_asterisk:
        has_telephony = False
        try:
            if settings.telephony_provider == "telnyx":
                has_telephony = bool(settings.telnyx_api_key and settings.telnyx_account_sid)
            else:
                has_telephony = bool(settings.twilio_account_sid and settings.twilio_auth_token)
        except Exception:
            pass
            
        if not has_telephony and settings.asterisk_audiosocket_enabled:
            trunks_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).execute()
            if trunks_res.data:
                use_asterisk = True
                trunk_id = trunks_res.data[0]["id"]
                if did_res.data:
                    # Use the first DID regardless of provider for caller ID
                    from_number = did_res.data[0].get("phone_number")
                    did_number_id = did_res.data[0].get("id")
                else:
                    # Fallback: look up phone_numbers (NOT a did_numbers FK, so don't set did_number_id)
                    phone_res = db.table("phone_numbers").select("id, phone_number").eq("agent_id", agent_id).eq("status", "active").execute()
                    if phone_res.data:
                        from_number = phone_res.data[0].get("phone_number")

    import uuid
    call_id = str(uuid.uuid4())

    if use_asterisk:
        if not trunk_id:
            trunks_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).execute()
            if not trunks_res.data:
                raise HTTPException(status_code=400, detail="No active SIP Trunk provider found for Asterisk test call")
            trunk_id = trunks_res.data[0]["id"]
            
        # Register call in memory
        from app.services.call_session_manager import call_session_manager
        call_session_manager.register_inbound_asterisk_call(
            call_uuid=call_id,
            caller_id=from_number,
            dialed_number=to_number,
            workspace_id=str(workspace_id),
            agent_id=str(agent_id),
            phone_number_id=str(did_number_id) if did_number_id else ""
        )
        
        # Insert call record in DB
        call_record = {
            "id": call_id,
            "call_uuid": call_id,
            "twilio_call_sid": call_id,
            "workspace_id": workspace_id,
            "agent_id": agent_id,
            "caller_phone_number": from_number or "unknown",
            "caller_id": from_number or "unknown",
            "dialed_number": to_number,
            "direction": "outbound",
            "status": "ringing",
            "provider": "asterisk",
            "metadata": {"provider": "asterisk", "is_test": True}
        }
        # Only set did_number_id if we have a real FK reference to did_numbers
        if did_number_id:
            call_record["did_number_id"] = did_number_id
        try:
            db.table("calls").insert(call_record).execute()
            logger.info(f"[Asterisk Test Call] Registered outbound call record {call_id} in DB")
        except Exception as db_err:
            logger.error(f"[Asterisk Test Call] Failed to write call record to DB: {db_err}")
            raise HTTPException(status_code=500, detail=f"Database write failure: {db_err}")
            
        # Originate call: try VPS HTTP API → SSH → manual fallback
        import subprocess
        import os
        import httpx
        dial_number = to_number.strip()
        if not dial_number.startswith('+'):
            dial_number = '+' + dial_number
        originate_cmd = f"asterisk -rx 'channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \"{from_number}\"'"
        
        call_originated = False
        
        # Strategy 1: Call the VPS backend HTTP API (most reliable from Windows dev machine)
        vps_api_url = (settings.asterisk_vps_url or "").rstrip("/")
        if vps_api_url:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    vps_resp = await client.post(
                        f"{vps_api_url}/api/calls/asterisk/outbound",
                        json={
                            "to_number": to_number,
                            "from_number": from_number or "",
                            "workspace_id": workspace_id,
                            "agent_id": agent_id,
                            "call_id": call_id,
                            "trunk_id": trunk_id,
                        }
                    )
                    if vps_resp.status_code == 200:
                        call_originated = True
                        resp_data = vps_resp.json()
                        logger.info(f"[Asterisk Test Call] VPS HTTP API originate succeeded: {resp_data}")
                        
                        vps_call_uuid = resp_data.get("call_uuid")
                        vps_db_call_id = resp_data.get("call_id")
                        
                        # If the VPS returned a different UUID (e.g. it ran its own generation / has older code)
                        # sync our local session manager and clean up duplicate DB records
                        if vps_call_uuid and vps_call_uuid != call_id:
                            logger.info(f"[Asterisk Test Call] VPS returned different call_uuid: {vps_call_uuid}. Aligning local session.")
                            
                            # 1. Unregister old local call
                            from app.services.call_session_manager import call_session_manager
                            call_session_manager.cleanup_call(call_id)
                            
                            # 2. Register new VPS call_uuid
                            call_session_manager.register_inbound_asterisk_call(
                                call_uuid=vps_call_uuid,
                                caller_id=from_number,
                                dialed_number=to_number,
                                workspace_id=str(workspace_id),
                                agent_id=str(agent_id),
                                phone_number_id=str(did_number_id) if did_number_id else ""
                            )
                            
                            # 3. Clean up the duplicate local call record (since the VPS inserted its own)
                            try:
                                db.table("calls").delete().eq("id", call_id).execute()
                                logger.info(f"[Asterisk Test Call] Deleted duplicate local call record: {call_id}")
                            except Exception as cleanup_err:
                                logger.warning(f"[Asterisk Test Call] Failed to clean up duplicate local call record: {cleanup_err}")
                                
                            # 4. Use VPS DB ID for subsequent reference
                            if vps_db_call_id:
                                call_id = vps_db_call_id
                    else:
                        logger.warning(f"[Asterisk Test Call] VPS HTTP API returned {vps_resp.status_code}: {vps_resp.text}")
            except Exception as http_err:
                logger.warning(f"[Asterisk Test Call] VPS HTTP API failed: {http_err}")

        # Strategy 2: Run asterisk locally (works if running ON the VPS, or via WSL on Windows)
        if not call_originated:
            import platform
            if platform.system() == "Windows":
                cmd = ["wsl", "-u", "root", "asterisk", "-rx", f"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \"{from_number}\""]
            else:
                cmd = ["asterisk", "-rx", f"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \"{from_number}\""]
            try:
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
                if res.returncode == 0:
                    call_originated = True
                    logger.info("[Asterisk Test Call] Local originate succeeded")
                else:
                    logger.warning(f"[Asterisk Test Call] Local/WSL originate failed: {res.stderr}")
            except (FileNotFoundError, subprocess.SubprocessError) as err:
                logger.warning(f"[Asterisk Test Call] Local/WSL originate execution failed: {err}")
 
        # Strategy 3: SSH into VPS and run the command
        if not call_originated:
            ssh_host = settings.asterisk_ssh_host
            ssh_user = settings.asterisk_ssh_user
            ssh_key = settings.asterisk_ssh_key_path or ""
            ssh_cmd = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5"]
            if ssh_key:
                ssh_cmd += ["-i", ssh_key]
            ssh_cmd += [
                f"{ssh_user}@{ssh_host}",
                f"asterisk -rx 'channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \"{from_number}\"'"
            ]
            try:
                ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
                if ssh_res.returncode == 0:
                    call_originated = True
                    logger.info("[Asterisk Test Call] SSH originate succeeded")
            except Exception as ssh_err:
                logger.warning(f"[Asterisk Test Call] SSH failed: {ssh_err}")

        # Strategy 4: Return manual command for user to run on VPS
        if not call_originated:
            border = "=" * 80
            logger.info(f"\n{border}\n[MANUAL ACTION REQUIRED] All automatic originate methods failed.\n"
                        f"Run this command directly in your VPS terminal:\n\n"
                        f"  {originate_cmd}\n{border}\n")
            return {
                "status": "manual_required",
                "call_sid": call_id,
                "to": to_number,
                "call_id": call_id,
                "message": "Run the originate command in your VPS terminal to start the call.",
                "command": originate_cmd
            }
                
        return {"status": "calling", "call_sid": call_id, "to": to_number, "call_id": call_id}

    # Standard Twilio/Telnyx route fallback
    telephony = _get_telephony()

    # Determine the from_ number: env var → first number on account
    if settings.telephony_provider == "telnyx":
        from_number = settings.telnyx_phone_number or telephony.get_first_phone_number()
    else:
        from_number = settings.twilio_phone_number or telephony.get_first_phone_number()

    if not from_number:
        provider_name = settings.telephony_provider.capitalize()
        raise HTTPException(
            status_code=503,
            detail=f"No {provider_name} phone number available. Add {provider_name.upper()}_PHONE_NUMBER to your .env."
        )

    # Resolve the public base URL dynamically from request headers
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.url.netloc
    
    # If accessed via localhost/127.0.0.1, fallback to configured base URL / webhook base URL
    if ("localhost" in host or "127.0.0.1" in host):
        if settings.public_base_url:
            webhook_base = settings.public_base_url.rstrip("/")
        else:
            if settings.telephony_provider == "telnyx":
                webhook_base = (settings.telnyx_webhook_url or "").rstrip("/").removesuffix("/api/webhooks/telnyx/inbound").removesuffix("/api/webhook/telnyx/inbound")
            else:
                webhook_base = (settings.twilio_webhook_url or "").rstrip("/").removesuffix("/api/webhooks/twilio/inbound").removesuffix("/api/webhook/twilio/inbound")
    else:
        webhook_base = f"{proto}://{host}"

    if settings.telephony_provider == "telnyx":
        texml_url = f"{webhook_base}/api/webhooks/telnyx/test-call?agent_id={agent_id}&call_db_id={call_id}"
        status_callback_url = f"{webhook_base}/api/webhooks/telnyx/status"
    else:
        texml_url = f"{webhook_base}/api/webhooks/twilio/test-call?agent_id={agent_id}&call_db_id={call_id}"
        status_callback_url = f"{webhook_base}/api/webhooks/twilio/status"

    # Log the call in DB first with our pre-generated call_id to prevent webhook race conditions
    pn_result = db.table("phone_numbers").select("id").eq("phone_number", from_number).execute()
    pn_id = pn_result.data[0]["id"] if pn_result.data else None

    db.table("calls").insert({
        "id": call_id,
        "workspace_id": workspace_id,
        "agent_id": agent_id,
        "phone_number_id": pn_id,
        "caller_phone_number": to_number,
        "twilio_call_sid": f"pending-{call_id}",  # will be updated with actual SID below
        "direction": "outbound",
        "status": "ringing",
        "metadata": {"is_test": True, "provider": settings.telephony_provider}
    }).execute()

    try:
        call_sid = telephony.make_outbound_call(
            to=to_number,
            from_=from_number,
            texml_url=texml_url,
            status_callback_url=status_callback_url,
        )

        # Update call record with real Twilio/Telnyx CallSid
        db.table("calls").update({
            "twilio_call_sid": call_sid
        }).eq("id", call_id).execute()

    except Exception as e:
        logger.error(f"Test call failed: {e}", exc_info=True)
        # Update status to failed
        try:
            db.table("calls").update({"status": "failed"}).eq("id", call_id).execute()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "calling", "call_sid": call_sid, "to": to_number, "call_id": call_id}


asterisk_router = APIRouter()

@asterisk_router.post("/api/calls/asterisk/outbound")
async def asterisk_outbound_call(body: Dict[str, Any], db: Client = Depends(get_db)):
    """
    Outbound SIP Trunk route for Asterisk. Originate a call via PJSIP/AudioSocket.
    Accepts an optional call_id and trunk_id when called from the test-call endpoint
    (so the UUID stays consistent between the registered session and the originate command).
    """
    to_number = body.get("to_number", "").strip()
    from_number = body.get("from_number", "").strip()
    workspace_id = body.get("workspace_id", "").strip()
    agent_id = body.get("agent_id", "").strip()
    # Optional: pre-generated call_id and trunk_id from the calling backend
    provided_call_id = body.get("call_id", "").strip()
    provided_trunk_id = body.get("trunk_id", "").strip()

    if not to_number or not workspace_id or not agent_id:
        raise HTTPException(
            status_code=400,
            detail="Missing required body fields: to_number, workspace_id, agent_id"
        )

    # Validate agent exists and is tied to the workspace
    agent_result = db.table("agents").select("id").eq("id", agent_id).eq("workspace_id", workspace_id).execute()
    if not agent_result.data:
        raise HTTPException(status_code=404, detail="Agent not found in specified workspace")

    trunk_id = provided_trunk_id or None

    # Find DID and trunk if not provided
    if from_number:
        did_res = db.table("did_numbers").select("id, sip_trunk_provider_id").eq("phone_number", from_number).execute()
        phone_id = None

        if did_res.data:
            phone_id = did_res.data[0]["id"]
            if not trunk_id:
                trunk_id = did_res.data[0].get("sip_trunk_provider_id")
        else:
            phone_res = db.table("phone_numbers").select("id").eq("phone_number", from_number).execute()
            if phone_res.data:
                phone_id = phone_res.data[0]["id"]
    else:
        phone_id = None
        did_res = type("obj", (object,), {"data": []})()

    if not trunk_id:
        trunks_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).execute()
        if not trunks_res.data:
            raise HTTPException(status_code=400, detail=f"No active SIP Trunk provider found in workspace {workspace_id}")
        trunk_id = trunks_res.data[0]["id"]

    import uuid
    import os

    # Reuse call_id if provided (avoids UUID mismatch with registered call session)
    if provided_call_id:
        call_uuid = provided_call_id
        db_call_id = provided_call_id
        skip_db_insert = True  # caller already inserted the record
    else:
        db_call_id = str(uuid.uuid4())
        call_uuid = str(uuid.uuid4())
        skip_db_insert = False

    if not skip_db_insert:
        # Pre-register call details in CallSessionManager in-memory cache
        from app.services.call_session_manager import call_session_manager
        call_session_manager.register_inbound_asterisk_call(
            call_uuid=call_uuid,
            caller_id=from_number or "unknown",
            dialed_number=to_number,
            workspace_id=str(workspace_id),
            agent_id=str(agent_id),
            phone_number_id=str(phone_id) if phone_id else ""
        )

        from datetime import datetime, timezone
        call_record = {
            "id": db_call_id,
            "call_uuid": call_uuid,
            "twilio_call_sid": call_uuid,
            "workspace_id": workspace_id,
            "agent_id": agent_id,
            "caller_phone_number": from_number or "unknown",
            "caller_id": from_number or "unknown",
            "dialed_number": to_number,
            "direction": "outbound",
            "status": "ringing",
            "provider": "asterisk",
            "metadata": {"provider": "asterisk"}
        }
        if phone_id and did_res.data:
            call_record["did_number_id"] = phone_id
        try:
            db.table("calls").insert(call_record).execute()
            logger.info(f"[Asterisk Outbound] Registered outbound call record {call_uuid} in DB")
        except Exception as db_err:
            logger.error(f"[Asterisk Outbound] Failed to write call record to DB: {db_err}")
            raise HTTPException(status_code=500, detail=f"Database write failure: {db_err}")

    # Originate the call
    import subprocess
    dial_number = to_number.strip()
    if not dial_number.startswith('+'):
        dial_number = '+' + dial_number
    caller_id = from_number or "+18166536732"
    originate_cmd = f"asterisk -rx 'channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_uuid},127.0.0.1:9092 \"{caller_id}\"'"
    cmd = ["asterisk", "-rx", f"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_uuid},127.0.0.1:9092 \"{caller_id}\""]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if res.returncode != 0:
            logger.warning(f"[Asterisk Outbound] Local originate failed (code {res.returncode}): {res.stderr}")
            raise FileNotFoundError()
        logger.info("[Asterisk Outbound] Local originate succeeded")
    except (FileNotFoundError, subprocess.SubprocessError):
        ssh_host = os.getenv("ASTERISK_SSH_HOST", "72.60.202.148")
        ssh_user = os.getenv("ASTERISK_SSH_USER", "root")
        logger.info(f"[Asterisk Outbound] Attempting SSH fallback to {ssh_user}@{ssh_host}...")
        ssh_cmd = [
            "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
            f"{ssh_user}@{ssh_host}",
            originate_cmd
        ]
        try:
            ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
            if ssh_res.returncode != 0:
                raise FileNotFoundError()
            logger.info("[Asterisk Outbound] SSH originate succeeded")
        except Exception as ssh_err:
            border = "=" * 80
            logger.info(f"\n{border}\n[MANUAL ACTION REQUIRED] SSH connection could not connect passwordlessly.\n"
                        f"Run this command in your VPS terminal:\n\n"
                        f"  {originate_cmd}\n{border}\n")
            return {
                "status": "manual_required",
                "call_uuid": call_uuid,
                "call_id": db_call_id,
                "message": "Run the originate command in your VPS terminal.",
                "command": originate_cmd
            }

    return {"status": "calling", "call_uuid": call_uuid, "call_id": db_call_id}


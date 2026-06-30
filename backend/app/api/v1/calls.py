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


@router.post("/{workspace_id}/calls/{call_id}/end")
async def end_active_call(
    workspace_id: str,
    call_id: str,
    db: Client = Depends(get_db),
):
    """Programmatically terminate an active call."""
    call_result = db.table("calls").select("id, twilio_call_sid, status").eq("workspace_id", workspace_id).eq("id", call_id).execute()
    if not call_result.data:
        raise HTTPException(status_code=404, detail="Call not found")
    
    call_data = call_result.data[0]
    call_sid = call_data.get("twilio_call_sid")
    current_status = call_data.get("status")
    
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if current_status in ("completed", "failed", "no_answer", "canceled", "busy"):
        return {"status": "already_terminated"}
    
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
    phone_id = None
    trunk_id = None
    
    if did_res.data:
        for did in did_res.data:
            if did.get("provider") == "asterisk":
                use_asterisk = True
                from_number = did.get("phone_number")
                phone_id = did.get("id")
                trunk_id = did.get("sip_trunk_provider_id")
                break

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
            phone_number_id=str(phone_id) if phone_id else ""
        )
        
        # Insert call record in DB
        try:
            db.table("calls").insert({
                "id": call_id,
                "call_uuid": call_id,
                "twilio_call_sid": call_id,
                "workspace_id": workspace_id,
                "agent_id": agent_id,
                "did_number_id": phone_id,
                "caller_phone_number": from_number,
                "caller_id": from_number,
                "dialed_number": to_number,
                "direction": "outbound",
                "status": "ringing",
                "provider": "asterisk",
                "metadata": {"provider": "asterisk", "is_test": True}
            }).execute()
            logger.info(f"[Asterisk Test Call] Registered outbound call record {call_id} in DB")
        except Exception as db_err:
            logger.error(f"[Asterisk Test Call] Failed to write call record to DB: {db_err}")
            raise HTTPException(status_code=500, detail="Database write failure")
            
        # Originate via subprocess / SSH
        import subprocess
        import os
        dial_number = to_number.lstrip('+')
        originate_cmd = f"asterisk -rx \"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \\\"{from_number}\\\"\""
        cmd = ["asterisk", "-rx", f"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \"{from_number}\""]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if res.returncode != 0:
                raise FileNotFoundError()
            logger.info("[Asterisk Test Call] Local originate succeeded")
        except (FileNotFoundError, subprocess.SubprocessError):
            ssh_host = os.getenv("ASTERISK_SSH_HOST") or "72.60.202.148"
            ssh_user = os.getenv("ASTERISK_SSH_USER") or "root"
            ssh_cmd = [
                "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
                f"{ssh_user}@{ssh_host}",
                f"asterisk -rx \"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_id},127.0.0.1:9092 \\\"{from_number}\\\"\""
            ]
            try:
                ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
                if ssh_res.returncode != 0:
                    raise FileNotFoundError()
                logger.info("[Asterisk Test Call] SSH originate succeeded")
            except Exception as ssh_err:
                border = "=" * 80
                logger.info(f"\n{border}\n[MANUAL ACTION REQUIRED] SSH connection could not connect passwordlessly.\n"
                            f"Please run the following command directly inside your VPS terminal:\n\n"
                            f"  {originate_cmd}\n{border}\n")
                return {
                    "status": "calling", 
                    "call_sid": call_id, 
                    "to": to_number, 
                    "call_id": call_id,
                    "message": "Manual action required: Run the originate command in your remote VPS terminal.",
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
    """
    to_number = body.get("to_number", "").strip()
    from_number = body.get("from_number", "").strip()
    workspace_id = body.get("workspace_id", "").strip()
    agent_id = body.get("agent_id", "").strip()

    if not to_number or not from_number or not workspace_id or not agent_id:
        raise HTTPException(
            status_code=400,
            detail="Missing required body fields: to_number, from_number, workspace_id, agent_id"
        )

    # Validate agent exists and is tied to the workspace
    agent_result = db.table("agents").select("id").eq("id", agent_id).eq("workspace_id", workspace_id).execute()
    if not agent_result.data:
        raise HTTPException(status_code=404, detail="Agent not found in specified workspace")

    # Find the corresponding phone number id / DID number id
    did_res = db.table("did_numbers").select("id, sip_trunk_provider_id").eq("phone_number", from_number).execute()
    phone_id = None
    trunk_id = None
    
    if did_res.data:
        phone_id = did_res.data[0]["id"]
        trunk_id = did_res.data[0].get("sip_trunk_provider_id")
    else:
        # Fallback to phone_numbers table
        phone_res = db.table("phone_numbers").select("id").eq("phone_number", from_number).execute()
        if phone_res.data:
            phone_id = phone_res.data[0]["id"]

    if not trunk_id:
        # Fallback: find any active asterisk trunk in the workspace
        trunks_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).execute()
        if not trunks_res.data:
            raise HTTPException(status_code=400, detail=f"No active SIP Trunk provider found in workspace {workspace_id}")
        trunk_id = trunks_res.data[0]["id"]

    # Generate unique UUIDs for both DB id and calls table call_uuid
    import uuid
    db_call_id = str(uuid.uuid4())
    call_uuid = str(uuid.uuid4())

    # Pre-register call details in CallSessionManager in-memory cache
    from app.services.call_session_manager import call_session_manager
    call_session_manager.register_inbound_asterisk_call(
        call_uuid=call_uuid,
        caller_id=from_number,
        dialed_number=to_number,
        workspace_id=str(workspace_id),
        agent_id=str(agent_id),
        phone_number_id=str(phone_id) if phone_id else ""
    )

    import os
    from datetime import datetime, timezone
    
    # Insert call record
    try:
        db.table("calls").insert({
            "id": db_call_id,
            "call_uuid": call_uuid,
            "twilio_call_sid": call_uuid,  # fallback for uniqueness
            "workspace_id": workspace_id,
            "agent_id": agent_id,
            "phone_number_id": phone_id if not did_res.data else None,
            "did_number_id": phone_id if did_res.data else None,
            "caller_phone_number": from_number,
            "caller_id": from_number,
            "dialed_number": to_number,
            "direction": "outbound",
            "status": "ringing",
            "provider": "asterisk",
            "metadata": {"provider": "asterisk"}
        }).execute()
        logger.info(f"[Asterisk Outbound] Registered outbound call record {call_uuid} in DB")
    except Exception as db_err:
        logger.error(f"[Asterisk Outbound] Failed to write call record to DB: {db_err}")
        raise HTTPException(status_code=500, detail="Database write failure")

    # Originate the call
    import subprocess
    dial_number = to_number.lstrip('+')
    originate_cmd = f"asterisk -rx \"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_uuid},127.0.0.1:9092 \\\"{from_number}\\\"\""
    cmd = ["asterisk", "-rx", f"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_uuid},127.0.0.1:9092 \"{from_number}\""]
    
    try:
        # 1. Try local execution (when running on VPS in production)
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if res.returncode != 0:
            logger.warning(f"[Asterisk Outbound] Local originate failed (code {res.returncode}): {res.stderr}")
            raise FileNotFoundError() # trigger SSH fallback
        logger.info("[Asterisk Outbound] Local originate succeeded")
    except (FileNotFoundError, subprocess.SubprocessError):
        # 2. Try remote SSH execution (fallback for local development)
        ssh_host = os.getenv("ASTERISK_SSH_HOST") or "72.60.202.148"
        ssh_user = os.getenv("ASTERISK_SSH_USER") or "root"
        logger.info(f"[Asterisk Outbound] Attempting SSH fallback to {ssh_user}@{ssh_host}...")
        
        # BatchMode=yes prevents hanging on password prompts
        ssh_cmd = [
            "ssh", 
            "-o", "BatchMode=yes", 
            "-o", "ConnectTimeout=5", 
            f"{ssh_user}@{ssh_host}", 
            f"asterisk -rx \"channel originate PJSIP/{dial_number}@provider-{trunk_id} application AudioSocket {call_uuid},127.0.0.1:9092 \\\"{from_number}\\\"\""
        ]
        try:
            ssh_res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=12)
            if ssh_res.returncode != 0:
                raise FileNotFoundError()
            logger.info("[Asterisk Outbound] SSH originate succeeded")
        except Exception as ssh_err:
            # Log manual action required
            border = "=" * 80
            logger.info(f"\n{border}\n[MANUAL ACTION REQUIRED] SSH connection could not connect passwordlessly.\n"
                        f"Please run the following command directly inside your VPS terminal:\n\n"
                        f"  {originate_cmd}\n{border}\n")
            return {
                "status": "calling", 
                "call_uuid": call_uuid, 
                "call_id": db_call_id,
                "message": "Manual action required: Run the originate command in your remote VPS terminal.",
                "command": originate_cmd
            }

    return {"status": "calling", "call_uuid": call_uuid, "call_id": db_call_id}


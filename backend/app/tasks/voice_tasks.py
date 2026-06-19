import logging
import time
from typing import Any, Dict
from datetime import datetime, timezone as dt_timezone
from app.core.celery_app import celery_app
from app.db.client import get_supabase_client
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_telephony():
    """Helper to initialize telephony service from config."""
    from app.services.telephony_service import TelephonyService
    if settings.telephony_provider == "telnyx":
        return TelephonyService(
            account_sid=settings.telnyx_account_sid,
            auth_token_or_api_key=settings.telnyx_api_key,
            provider="telnyx"
        )
    return TelephonyService(
        account_sid=settings.twilio_account_sid,
        auth_token_or_api_key=settings.twilio_auth_token,
        provider="twilio"
    )

def _handle_task_completion(db, task_id: str, success: bool):
    """Update task status and handle recurrence logic."""
    from .scheduler import calculate_next_run

    task_res = db.table("scheduled_tasks").select("*").eq("id", task_id).execute()
    if not task_res.data:
        return

    task = task_res.data[0]
    rrule = task.get("recurrence_rule")

    if rrule:
        next_run = calculate_next_run(rrule, datetime.now(dt_timezone.utc))
        if next_run:
            db.table("scheduled_tasks").update({
                "status": "scheduled",
                "next_run_at": next_run.isoformat()
            }).eq("id", task_id).execute()
            return

    final_status = "completed" if success else "failed"
    db.table("scheduled_tasks").update({"status": final_status}).eq("id", task_id).execute()

def run_voice_call(task_id: str, payload: Dict[str, Any], attempt: int = 1):
    """Direct execution logic for a voice call with full telephony integration."""
    db = get_supabase_client()
    start_time = time.time()

    try:
        # 1. Fetch task data
        task_res = db.table("scheduled_tasks").select("*").eq("id", task_id).execute()
        if not task_res.data:
            raise ValueError(f"Task {task_id} not found")
        task = task_res.data[0]

        agent_id = task["agent_id"]
        workspace_id = task["workspace_id"]
        to_number = payload.get("to")

        if not to_number:
            raise ValueError("Recipient phone number ('to') missing in payload")

        # 2. Setup Telephony
        telephony = _get_telephony()

        if settings.public_base_url:
            webhook_base = settings.public_base_url.rstrip("/")
        else:
            if settings.telephony_provider == "telnyx":
                webhook_base = (settings.telnyx_webhook_url or "").rstrip("/").removesuffix("/api/webhooks/telnyx/inbound").removesuffix("/api/webhook/telnyx/inbound")
            else:
                webhook_base = (settings.twilio_webhook_url or "").rstrip("/").removesuffix("/api/webhooks/twilio/inbound").removesuffix("/api/webhook/twilio/inbound")

        if settings.telephony_provider == "telnyx":
            from_number = settings.telnyx_phone_number or telephony.get_first_phone_number()
            texml_url = f"{webhook_base}/api/webhooks/telnyx/test-call?agent_id={agent_id}&workspace_id={workspace_id}"
            status_callback_url = f"{webhook_base}/api/webhooks/telnyx/status"
        else:
            from_number = settings.twilio_phone_number or telephony.get_first_phone_number()
            texml_url = f"{webhook_base}/api/webhooks/twilio/test-call?agent_id={agent_id}&workspace_id={workspace_id}"
            status_callback_url = f"{webhook_base}/api/webhooks/twilio/status"

        if not from_number:
            raise ValueError(f"No phone number available for provider {settings.telephony_provider}")

        # Normalize phone numbers to E.164 (remove spaces, dashes, parens)
        def _normalize(num: str) -> str:
            import re
            return re.sub(r"[\s\-\(\)]", "", num)

        to_number = _normalize(to_number)
        from_number = _normalize(from_number)

        logger.info(f"Triggering outbound call from {from_number} to {to_number} for agent {agent_id}")

        # 3. Place Call
        call_sid = telephony.make_outbound_call(
            to=to_number,
            from_=from_number,
            texml_url=texml_url,
            status_callback_url=status_callback_url,
        )

        # 4. Insert call record after we have the real call_sid
        normalized_from = from_number.replace(" ", "").replace("-", "")
        pn_result = db.table("phone_numbers").select("id").eq("phone_number", normalized_from).execute()
        if not pn_result.data:
            pn_result = db.table("phone_numbers").select("id").eq("phone_number", from_number).execute()
        pn_id = pn_result.data[0]["id"] if pn_result.data else None

        try:
            db.table("calls").insert({
                "workspace_id": workspace_id,
                "agent_id": agent_id,
                "phone_number_id": pn_id,
                "caller_phone_number": to_number,
                "twilio_call_sid": call_sid,
                "direction": "outbound",
                "status": "ringing",
                "metadata": {"is_scheduled": True, "task_id": task_id}
            }).execute()
        except Exception as db_err:
            # Log the DB error but don't fail the task — call was already placed
            logger.warning(f"Could not insert call record for scheduled call {task_id}: {db_err}")

        # 5. Log task success (non-fatal if these DB writes fail)
        duration = int((time.time() - start_time) * 1000)

        try:
            db.table("scheduled_task_logs").insert({
                "scheduled_task_id": task_id,
                "status": "success",
                "attempt_number": attempt,
                "duration_ms": duration,
                "finished_at": datetime.now(dt_timezone.utc).isoformat(),
                "result": {"call_sid": call_sid}
            }).execute()
        except Exception as e:
            logger.warning(f"Could not insert success log for {task_id}: {e}")

        try:
            db.table("notifications").insert({
                "user_id": task["user_id"],
                "workspace_id": workspace_id,
                "title": "Task Executed",
                "message": f"Scheduled call '{task['title']}' was triggered successfully.",
                "type": "task_completed"
            }).execute()
        except Exception as e:
            logger.warning(f"Could not insert notification for {task_id}: {e}")

        _handle_task_completion(db, task_id, True)
        return True

    except Exception as exc:
        logger.error(f"Scheduled call {task_id} failed: {exc}", exc_info=True)

        db.table("scheduled_task_logs").insert({
            "scheduled_task_id": task_id,
            "status": "failed",
            "attempt_number": attempt,
            "error_message": str(exc),
            "finished_at": datetime.now(dt_timezone.utc).isoformat()
        }).execute()

        _handle_task_completion(db, task_id, False)
        return False

def run_webhook(task_id: str, payload: Dict[str, Any], attempt: int = 1):
    """Direct execution logic for a webhook."""
    import httpx
    db = get_supabase_client()
    url = payload.get("url")

    try:
        if not url:
            raise ValueError("Webhook URL missing in payload")

        with httpx.Client() as client:
            resp = client.post(url, json=payload.get("data", {}), timeout=10.0)
            resp.raise_for_status()

        _handle_task_completion(db, task_id, True)
        return True
    except Exception as e:
        logger.error(f"Webhook {task_id} failed: {e}")
        _handle_task_completion(db, task_id, False)
        return False

@celery_app.task(bind=True, max_retries=3)
def execute_voice_call(self, task_id: str, payload: Dict[str, Any]):
    if not run_voice_call(task_id, payload, attempt=self.request.retries + 1):
        raise self.retry(countdown=60 * (self.request.retries + 1))

@celery_app.task(bind=True, max_retries=3)
def execute_webhook(self, task_id: str, payload: Dict[str, Any]):
    if not run_webhook(task_id, payload, attempt=self.request.retries + 1):
        raise self.retry(countdown=60 * (self.request.retries + 1))

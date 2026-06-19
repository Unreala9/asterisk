from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.db.client import get_db, Client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{workspace_id}/phone-numbers")
async def list_phone_numbers(workspace_id: str, db: Client = Depends(get_db)):
    result = (
        db.table("phone_numbers")
        .select("*, agents(id, name)")
        .eq("workspace_id", workspace_id)
        .neq("status", "deleted")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/{workspace_id}/phone-numbers")
async def add_phone_number(workspace_id: str, body: Dict[str, Any], db: Client = Depends(get_db)):
    phone_number: str = (body.get("phone_number") or "").strip()
    if not phone_number:
        raise HTTPException(status_code=400, detail="phone_number is required")

    # provider_id must be unique; use phone_number itself if not provided
    provider_id = (body.get("provider_id") or phone_number).strip()

    # Detect country code from E.164 if not supplied
    country_code = (body.get("country_code") or "").strip()
    if not country_code and phone_number.startswith("+1"):
        country_code = "US"
    elif not country_code:
        country_code = "US"

    payload = {
        "workspace_id": workspace_id,
        "phone_number": phone_number,
        "country_code": country_code,
        "friendly_name": body.get("friendly_name") or phone_number,
        "provider": body.get("provider") or "telnyx",
        "provider_id": provider_id,
        "agent_id": body.get("agent_id") or None,
        "inbound_enabled": body.get("inbound_enabled", True),
        "outbound_enabled": body.get("outbound_enabled", True),
        "status": "active",
    }

    try:
        result = db.table("phone_numbers").insert(payload).execute()
    except Exception as e:
        err = str(e)
        if "unique" in err.lower() or "duplicate" in err.lower():
            raise HTTPException(status_code=409, detail="Phone number already exists in this workspace")
        logger.error("Failed to insert phone number: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    return result.data[0]


@router.patch("/{workspace_id}/phone-numbers/{phone_number_id}")
async def update_phone_number(
    workspace_id: str,
    phone_number_id: str,
    body: Dict[str, Any],
    db: Client = Depends(get_db),
):
    existing = (
        db.table("phone_numbers")
        .select("id")
        .eq("workspace_id", workspace_id)
        .eq("id", phone_number_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Phone number not found")

    allowed_fields = {"agent_id", "friendly_name", "inbound_enabled", "outbound_enabled"}
    update_payload = {k: v for k, v in body.items() if k in allowed_fields}
    if not update_payload:
        raise HTTPException(status_code=400, detail="No updatable fields provided")

    # Allow explicitly unsetting agent_id
    if "agent_id" in body and not body["agent_id"]:
        update_payload["agent_id"] = None

    result = (
        db.table("phone_numbers")
        .update(update_payload)
        .eq("workspace_id", workspace_id)
        .eq("id", phone_number_id)
        .execute()
    )
    return result.data[0]


@router.delete("/{workspace_id}/phone-numbers/{phone_number_id}")
async def delete_phone_number(
    workspace_id: str,
    phone_number_id: str,
    db: Client = Depends(get_db),
):
    existing = (
        db.table("phone_numbers")
        .select("id")
        .eq("workspace_id", workspace_id)
        .eq("id", phone_number_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Phone number not found")

    db.table("phone_numbers").update({"status": "deleted", "agent_id": None}).eq("id", phone_number_id).execute()
    return {"status": "deleted"}

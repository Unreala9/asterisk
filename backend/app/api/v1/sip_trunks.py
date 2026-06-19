import logging
import socket
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator

from app.db.client import get_db, Client
from app.utils.security import encrypt_password, decrypt_password
from app.services.asterisk_config_generator import AsteriskConfigGenerator
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Pydantic Schemas ---

class SIPTrunkCreate(BaseModel):
    name: str
    provider_type: str
    auth_type: str
    sip_proxy: str
    sip_port: int = 5060
    transport: str = "udp"
    username: Optional[str] = None
    password: Optional[str] = None
    provider_ips: Optional[List[str]] = None
    allowed_codecs: List[str] = ["ulaw", "alaw"]
    outbound_caller_id: Optional[str] = None
    max_concurrent_calls: int = 10
    metadata: Optional[Dict[str, Any]] = None

    @validator("provider_type")
    def validate_provider_type(cls, v):
        allowed = {"airtel", "jio", "tata", "twilio", "exotel", "myoperator", "knowlarity", "custom"}
        if v not in allowed:
            raise ValueError(f"provider_type must be one of {allowed}")
        return v

    @validator("auth_type")
    def validate_auth_type(cls, v):
        allowed = {"ip_auth", "username_password"}
        if v not in allowed:
            raise ValueError(f"auth_type must be one of {allowed}")
        return v

    @validator("transport")
    def validate_transport(cls, v):
        allowed = {"udp", "tcp", "tls"}
        if v not in allowed:
            raise ValueError(f"transport must be one of {allowed}")
        return v

    @validator("allowed_codecs")
    def validate_codecs(cls, v):
        if not any(c in v for c in ["ulaw", "alaw"]):
            raise ValueError("allowed_codecs must include at least 'ulaw' or 'alaw' for telephony compatibility")
        return v

class SIPTrunkUpdate(BaseModel):
    name: Optional[str] = None
    provider_type: Optional[str] = None
    auth_type: Optional[str] = None
    sip_proxy: Optional[str] = None
    sip_port: Optional[int] = None
    transport: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    provider_ips: Optional[List[str]] = None
    allowed_codecs: Optional[List[str]] = None
    outbound_caller_id: Optional[str] = None
    max_concurrent_calls: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DIDNumberCreate(BaseModel):
    phone_number: str
    country_code: str
    label: Optional[str] = None
    provider: Optional[str] = None
    sip_trunk_provider_id: Optional[str] = None
    agent_id: Optional[str] = None
    inbound_enabled: bool = True
    outbound_enabled: bool = False
    recording_enabled: bool = False
    metadata: Optional[Dict[str, Any]] = None

class DIDNumberUpdate(BaseModel):
    label: Optional[str] = None
    sip_trunk_provider_id: Optional[str] = None
    agent_id: Optional[str] = None
    status: Optional[str] = None
    inbound_enabled: Optional[bool] = None
    outbound_enabled: Optional[bool] = None
    recording_enabled: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None

# --- Helper Functions ---

async def verify_workspace(workspace_id: str, db: Client) -> None:
    res = db.table("workspaces").select("id").eq("id", workspace_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Workspace not found")

# --- SIP Trunk Router Endpoints ---

@router.get("/{workspace_id}/sip-trunks")
async def list_sip_trunks(workspace_id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).execute()
    # Mask password
    trunks = []
    for r in res.data:
        r["password"] = "********" if r.get("password_encrypted") else None
        trunks.append(r)
    return trunks

@router.post("/{workspace_id}/sip-trunks")
async def create_sip_trunk(workspace_id: str, trunk: SIPTrunkCreate, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    
    # Custom validations
    if trunk.auth_type == "username_password":
        if not trunk.username or not trunk.password:
            raise HTTPException(status_code=400, detail="Username and password are required for username_password auth")
    elif trunk.auth_type == "ip_auth":
        if not trunk.provider_ips or len(trunk.provider_ips) == 0:
            raise HTTPException(status_code=400, detail="Provider IPs are required for ip_auth")

    password_encrypted = encrypt_password(trunk.password) if trunk.password else None

    payload = {
        "workspace_id": workspace_id,
        "name": trunk.name,
        "provider_type": trunk.provider_type,
        "auth_type": trunk.auth_type,
        "sip_proxy": trunk.sip_proxy,
        "sip_port": trunk.sip_port,
        "transport": trunk.transport,
        "username": trunk.username,
        "password_encrypted": password_encrypted,
        "outbound_caller_id": trunk.outbound_caller_id,
        "provider_ips": trunk.provider_ips,
        "allowed_codecs": trunk.allowed_codecs,
        "max_concurrent_calls": trunk.max_concurrent_calls,
        "status": "pending",
        "metadata": trunk.metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        res = db.table("sip_trunk_providers").insert(payload).execute()
        new_trunk = res.data[0]
        new_trunk["password"] = "********" if new_trunk.get("password_encrypted") else None
        return new_trunk
    except Exception as e:
        logger.error(f"Failed to create SIP Trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workspace_id}/sip-trunks/{id}")
async def get_sip_trunk(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    trunk = res.data[0]
    trunk["password"] = "********" if trunk.get("password_encrypted") else None
    return trunk

@router.patch("/{workspace_id}/sip-trunks/{id}")
async def update_sip_trunk(workspace_id: str, id: str, trunk_data: SIPTrunkUpdate, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    
    # Check exists and workspace isolation
    existing = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    update_dict = trunk_data.dict(exclude_unset=True)
    if "password" in update_dict:
        val = update_dict.pop("password")
        if val:
            update_dict["password_encrypted"] = encrypt_password(val)

    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        try:
            res = db.table("sip_trunk_providers").update(update_dict).eq("id", id).execute()
            updated_trunk = res.data[0]
            updated_trunk["password"] = "********" if updated_trunk.get("password_encrypted") else None
            return updated_trunk
        except Exception as e:
            logger.error(f"Failed to update SIP Trunk: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    existing.data[0]["password"] = "********" if existing.data[0].get("password_encrypted") else None
    return existing.data[0]

@router.delete("/{workspace_id}/sip-trunks/{id}")
async def delete_sip_trunk(workspace_id: str, id: str, soft: bool = True, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    existing = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    if soft:
        db.table("sip_trunk_providers").update({"status": "disabled", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", id).execute()
        return {"status": "disabled"}
    else:
        db.table("sip_trunk_providers").delete().eq("id", id).execute()
        return {"status": "deleted"}

@router.post("/{workspace_id}/sip-trunks/{id}/generate-asterisk-config")
async def generate_asterisk_config(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    trunk = res.data[0]
    # Decrypt password for config generation helper
    if trunk.get("password_encrypted"):
        trunk["password_decrypted"] = decrypt_password(trunk["password_encrypted"])
    
    # Generate masked configurations for the frontend
    masked_configs = AsteriskConfigGenerator.generate_config(trunk, mask_password=True)
    return masked_configs

@router.post("/{workspace_id}/sip-trunks/{id}/validate")
async def validate_sip_trunk(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    trunk = res.data[0]
    warnings = []
    
    # Proxy format check
    proxy = trunk.get("sip_proxy") or ""
    if not proxy:
        warnings.append("SIP Proxy is missing")
    
    # Provider IP format check
    provider_ips = trunk.get("provider_ips") or []
    if trunk.get("auth_type") == "ip_auth" and not provider_ips:
        warnings.append("IP Authentication enabled but no provider IPs configured")
    
    # Codec support check
    codecs = trunk.get("allowed_codecs") or []
    if not any(c in codecs for c in ["ulaw", "alaw"]):
        warnings.append(" Telephony requires ulaw or alaw codecs. Neither is configured.")

    # DID check
    dids_res = db.table("did_numbers").select("id").eq("sip_trunk_provider_id", id).execute()
    if not dids_res.data:
        warnings.append("No DID numbers linked to this SIP Trunk. Trunk won't route incoming calls.")

    return {
        "valid": len(warnings) == 0,
        "warnings": warnings
    }

@router.post("/{workspace_id}/sip-trunks/{id}/test")
async def test_sip_trunk(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    trunk = res.data[0]
    dns_success = False
    dns_error = None
    
    # Safe DNS check
    proxy = trunk.get("sip_proxy") or ""
    try:
        if proxy and not proxy.replace(".", "").isdigit():
            # Resolve DNS
            socket.gethostbyname(proxy)
        dns_success = True
    except Exception as e:
        dns_error = str(e)

    # AudioSocket running check
    audiosocket_running = False
    if settings.asterisk_audiosocket_enabled:
        # Check if we can connect to port
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1.0)
            s.connect((settings.asterisk_audiosocket_host, settings.asterisk_audiosocket_port))
            s.close()
            audiosocket_running = True
        except Exception:
            pass

    test_status = "success" if (dns_success and not dns_error) else "failed"

    # Insert test result
    test_payload = {
        "workspace_id": workspace_id,
        "sip_trunk_provider_id": id,
        "test_type": "dns_check",
        "status": test_status,
        "result": {
            "dns_resolved": dns_success,
            "audiosocket_running": audiosocket_running,
            "dns_error": dns_error
        },
        "error": dns_error,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    db.table("sip_trunk_test_results").insert(test_payload).execute()

    # Update trunk last checked
    db.table("sip_trunk_providers").update({
        "status": "active" if test_status == "success" else "error",
        "last_checked_at": datetime.now(timezone.utc).isoformat(),
        "last_error": dns_error
    }).eq("id", id).execute()

    return test_payload

@router.get("/{workspace_id}/sip-trunks/{id}/status")
async def get_sip_trunk_status(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("sip_trunk_providers").select("status, last_checked_at, last_error").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="SIP Trunk not found")
    
    status_data = res.data[0]
    
    # Count linked DIDs
    dids_res = db.table("did_numbers").select("id").eq("sip_trunk_provider_id", id).execute()
    status_data["linked_did_count"] = len(dids_res.data) if dids_res.data else 0
    status_data["active_calls"] = 0 # placeholder for call sessions count using this trunk
    
    return status_data


# --- DID Numbers Router Endpoints ---

@router.post("/{workspace_id}/did-numbers")
async def create_did_number(workspace_id: str, did: DIDNumberCreate, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    
    # Verify trunk belongs to workspace if supplied
    if did.sip_trunk_provider_id:
        trunk_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).eq("id", did.sip_trunk_provider_id).execute()
        if not trunk_res.data:
            raise HTTPException(status_code=400, detail="Linked SIP Trunk not found in this workspace")

    # Verify agent belongs to workspace if supplied
    if did.agent_id:
        agent_res = db.table("agents").select("id").eq("workspace_id", workspace_id).eq("id", did.agent_id).execute()
        if not agent_res.data:
            raise HTTPException(status_code=400, detail="Linked Agent not found in this workspace")

    payload = {
        "workspace_id": workspace_id,
        "sip_trunk_provider_id": did.sip_trunk_provider_id,
        "phone_number": did.phone_number,
        "country_code": did.country_code,
        "label": did.label,
        "provider": did.provider or "asterisk",
        "agent_id": did.agent_id,
        "status": "active",
        "inbound_enabled": did.inbound_enabled,
        "outbound_enabled": did.outbound_enabled,
        "recording_enabled": did.recording_enabled,
        "metadata": did.metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        res = db.table("did_numbers").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        logger.error(f"Failed to create DID number: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workspace_id}/did-numbers")
async def list_did_numbers(workspace_id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    res = db.table("did_numbers").select("*, agents(id, name), sip_trunk_providers(id, name)").eq("workspace_id", workspace_id).execute()
    return res.data

@router.patch("/{workspace_id}/did-numbers/{id}")
async def update_did_number(workspace_id: str, id: str, did_data: DIDNumberUpdate, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    existing = db.table("did_numbers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="DID number not found")
        
    update_dict = did_data.dict(exclude_unset=True)
    
    # Verify relationships
    if "sip_trunk_provider_id" in update_dict and update_dict["sip_trunk_provider_id"]:
        trunk_res = db.table("sip_trunk_providers").select("id").eq("workspace_id", workspace_id).eq("id", update_dict["sip_trunk_provider_id"]).execute()
        if not trunk_res.data:
            raise HTTPException(status_code=400, detail="Linked SIP Trunk not found in this workspace")
            
    if "agent_id" in update_dict and update_dict["agent_id"]:
        agent_res = db.table("agents").select("id").eq("workspace_id", workspace_id).eq("id", update_dict["agent_id"]).execute()
        if not agent_res.data:
            raise HTTPException(status_code=400, detail="Linked Agent not found in this workspace")

    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        try:
            res = db.table("did_numbers").update(update_dict).eq("id", id).execute()
            return res.data[0]
        except Exception as e:
            logger.error(f"Failed to update DID number: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return existing.data[0]

@router.delete("/{workspace_id}/did-numbers/{id}")
async def delete_did_number(workspace_id: str, id: str, db: Client = Depends(get_db)):
    await verify_workspace(workspace_id, db)
    existing = db.table("did_numbers").select("*").eq("workspace_id", workspace_id).eq("id", id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="DID number not found")
        
    db.table("did_numbers").update({"status": "disabled", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", id).execute()
    return {"status": "disabled"}

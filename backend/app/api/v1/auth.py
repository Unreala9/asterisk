import hmac
import hashlib
import base64
import json
import time
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.client import get_supabase_client
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

class SSOPayload(BaseModel):
    token: str

def to_base64_url(s: bytes) -> str:
    return base64.b64encode(s).decode("utf-8").replace("+", "-").replace("/", "_").rstrip("=")

def hmac_sign(message: str, secret: str) -> str:
    key = secret.encode("utf-8")
    msg = message.encode("utf-8")
    sig = hmac.new(key, msg, hashlib.sha256).digest()
    return to_base64_url(sig)

def decode_payload(encoded: str) -> Optional[dict]:
    try:
        # Add padding back if necessary
        padding = '=' * (4 - len(encoded) % 4)
        decoded_bytes = base64.urlsafe_b64decode(encoded + padding)
        return json.loads(decoded_bytes.decode('utf-8'))
    except Exception as e:
        logger.error(f"[SSO] Payload decode failed: {e}")
        return None

@router.post("/sso")
async def verify_sso(payload: SSOPayload):
    sso_secret = settings.voice_pilot_sso_secret
    if not sso_secret:
        logger.error("[SSO] voice_pilot_sso_secret not set in backend settings")
        raise HTTPException(status_code=503, detail="SSO not configured on this server")
    
    token = payload.token
    if not token:
        raise HTTPException(status_code=400, detail="Missing SSO token")
    
    # ── Split at last dot: "<encoded>.<signature>" ──
    last_dot = token.rfind('.')
    if last_dot < 1 or last_dot == len(token) - 1:
        raise HTTPException(status_code=400, detail="Malformed SSO token")
    
    encoded = token[:last_dot]
    signature = token[last_dot+1:]
    
    # ── Verify HMAC (constant-time) ──
    expected = hmac_sign(encoded, sso_secret)
    if not hmac.compare_digest(signature, expected):
        logger.warning("[SSO] Signature mismatch — rejected")
        raise HTTPException(status_code=401, detail="Invalid SSO token")
        
    # ── Decode and validate claims ──
    claims = decode_payload(encoded)
    if not claims:
        raise HTTPException(status_code=400, detail="Unreadable SSO payload")
        
    email = claims.get("email")
    aud = claims.get("aud")
    iss = claims.get("iss")
    exp = claims.get("exp")
    jti = claims.get("jti")
    
    if aud != "voicepilot":
        raise HTTPException(status_code=401, detail="Invalid token audience")
    if iss != "getaipilot.in":
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    if not email:
        raise HTTPException(status_code=400, detail="Token missing email")
    if not jti:
        raise HTTPException(status_code=400, detail="Token missing nonce")
    if not exp or (time.time() * 1000) > exp:
        raise HTTPException(status_code=401, detail="SSO token has expired")
        
    # ── Replay prevention: insert JTI ──
    db = get_supabase_client()
    try:
        expires_at_iso = datetime.fromtimestamp(exp / 1000.0, tz=timezone.utc).isoformat()
    except Exception:
        expires_at_iso = datetime.now(timezone.utc).isoformat()
        
    try:
        # Insert nonce into sso_nonces
        db.table("sso_nonces").insert({
            "jti": jti,
            "email": email,
            "expires_at": expires_at_iso
        }).execute()
    except Exception as nonce_err:
        err_msg = str(nonce_err)
        if "23505" in err_msg or "duplicate key" in err_msg or "already exists" in err_msg:
            logger.warning(f"[SSO] Replay detected for jti={jti} email={email}")
            raise HTTPException(status_code=401, detail="SSO token already used")
        logger.error(f"[SSO] Nonce insert error: {err_msg}")
        raise HTTPException(status_code=500, detail="Nonce check failed")

    # ── Generate Supabase magic-link ──
    client_url = settings.public_base_url or "https://voice.getaipilot.online"
    redirect_to = f"{client_url.rstrip('/')}/auth/callback"
    
    try:
        link_res = db.auth.admin.generate_link({
            "type": "magiclink",
            "email": email,
            "options": {
                "redirect_to": redirect_to
            }
        })
        action_link = link_res.properties.action_link
        if not action_link:
            raise Exception("No action link returned from Supabase")
            
        logger.info(f"[SSO] ✅ Issued magic link for {email}")
        return {
            "success": True,
            "magic_link_url": action_link
        }
    except Exception as link_err:
        logger.error(f"[SSO] generateLink error: {link_err}")
        raise HTTPException(status_code=500, detail=f"Failed to generate login link: {str(link_err)}")

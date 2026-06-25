import base64
import hashlib
import os
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_encryption_key() -> str:
    # Require SIP_ENCRYPTION_KEY env variable only
    key_str = os.getenv("SIP_ENCRYPTION_KEY")
    if not key_str:
        raise ValueError("SIP_ENCRYPTION_KEY env variable is required but not set")
    # Fernet requires a 32-byte urlsafe base64-encoded key. We hash the secret key to get 32 bytes.
    hashed = hashlib.sha256(key_str.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(hashed).decode("utf-8")

def encrypt_password(password: str) -> str:
    """Encrypt password string using Fernet."""
    if not password:
        return ""
    key = _get_encryption_key()
    fernet = Fernet(key.encode("utf-8"))
    return fernet.encrypt(password.encode("utf-8")).decode("utf-8")

def decrypt_password(encrypted_password: str) -> str:
    """Decrypt Fernet-encrypted password string."""
    if not encrypted_password:
        return ""
    try:
        key = _get_encryption_key()
        fernet = Fernet(key.encode("utf-8"))
        return fernet.decrypt(encrypted_password.encode("utf-8")).decode("utf-8")
    except Exception:
        # If decryption fails, return empty or raise error (we return empty and log it)
        import logging
        logging.getLogger(__name__).error("Failed to decrypt password. Might be plain-text or invalid key.")
        return ""

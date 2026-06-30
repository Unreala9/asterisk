import pytest
import jwt
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app
from app.db.client import get_db
from app.core.config import settings
from app.api.v1.admin import run_safe_asterisk_cmd
from app.utils.security import encrypt_password, decrypt_password

client = TestClient(app)

@pytest.fixture
def mock_db():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    yield db
    app.dependency_overrides.clear()

def test_verify_super_admin_requires_jwt():
    # Calling admin stats without token should return 403 or 401
    response = client.get("/api/admin/dashboard/stats")
    assert response.status_code in (401, 403)

def test_verify_super_admin_role_rejection(mock_db):
    # Construct a valid JWT payload for a regular user
    payload = {
        "sub": "user-123",
        "email": "user@example.com"
    }
    token = jwt.encode(payload, settings.supabase_jwt_secret, algorithm="HS256")
    
    # Mock DB response returning a non-admin role
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"role": "user", "email": "user@example.com"}
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/admin/dashboard/stats", headers=headers)
    assert response.status_code == 403
    assert "Super Admin role required" in response.json()["detail"]

def test_verify_super_admin_role_success(mock_db):
    # Construct a valid JWT payload for super admin
    payload = {
        "sub": "admin-123",
        "email": "admin@example.com"
    }
    token = jwt.encode(payload, settings.supabase_jwt_secret, algorithm="HS256")
    
    # Mock profiles table query
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"role": "super_admin", "email": "admin@example.com"}
    ]
    
    # Mock the other stats tables
    mock_db.table.return_value.select.return_value.execute.return_value.data = []
    mock_db.table.return_value.select.return_value.gte.return_value.execute.return_value.data = []
    
    # Mock Asterisk wrapper
    with patch("app.api.v1.admin.run_safe_asterisk_cmd", return_value="0 Active calls\npjsip show registrations: 0"):
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/dashboard/stats", headers=headers)
        assert response.status_code == 200
        assert response.json()["total_workspaces"] == 0

def test_safe_asterisk_command_execution():
    # Approved command
    with patch("subprocess.run") as mock_sub:
        mock_sub.return_value.returncode = 0
        mock_sub.return_value.stdout = "pjsip status"
        out = run_safe_asterisk_cmd("pjsip show registrations")
        assert "pjsip status" in out

    # Non-approved command should raise HTTP 400
    with pytest.raises(Exception) as excinfo:
        run_safe_asterisk_cmd("systemctl restart asterisk")
    assert "whitelist" in str(excinfo.value.detail).lower()

def test_password_encryption_decryption():
    plaintext = "super_secret_sip_pass_123"
    enc = encrypt_password(plaintext)
    assert enc != plaintext
    
    dec = decrypt_password(enc)
    assert dec == plaintext

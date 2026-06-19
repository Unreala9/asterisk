import pytest
import uuid
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app
from app.db.client import get_db
from app.services.call_session_manager import CallSessionManager

client = TestClient(app)

@pytest.fixture
def mock_db():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    yield db
    app.dependency_overrides.clear()

def test_create_sip_trunk_ip_auth(mock_db):
    workspace_id = str(uuid.uuid4())
    mock_db.table().select().eq().execute.return_value.data = [{"id": workspace_id}]
    
    payload = {
        "name": "Airtel IP Trunk",
        "provider_type": "airtel",
        "auth_type": "ip_auth",
        "sip_proxy": "10.12.1.20",
        "sip_port": 5060,
        "transport": "udp",
        "provider_ips": ["10.12.1.25", "10.12.1.26"],
        "allowed_codecs": ["ulaw", "alaw"],
        "max_concurrent_calls": 20
    }

    mock_db.table().insert().execute.return_value.data = [{
        "id": "trunk-123",
        "workspace_id": workspace_id,
        "name": "Airtel IP Trunk",
        "provider_type": "airtel",
        "auth_type": "ip_auth",
        "sip_proxy": "10.12.1.20",
        "sip_port": 5060,
        "transport": "udp",
        "provider_ips": ["10.12.1.25", "10.12.1.26"],
        "allowed_codecs": ["ulaw", "alaw"],
        "max_concurrent_calls": 20,
        "status": "pending",
        "password_encrypted": None
    }]

    response = client.post(f"/api/v1/workspaces/{workspace_id}/sip-trunks", json=payload)
    assert response.status_code == 200
    assert response.json()["id"] == "trunk-123"
    assert response.json()["auth_type"] == "ip_auth"

def test_create_sip_trunk_username_password(mock_db):
    workspace_id = str(uuid.uuid4())
    mock_db.table().select().eq().execute.return_value.data = [{"id": workspace_id}]

    payload = {
        "name": "Twilio Auth Trunk",
        "provider_type": "twilio",
        "auth_type": "username_password",
        "sip_proxy": "my-trunk.pstn.twilio.com",
        "username": "twiliouser",
        "password": "supersecretpassword",
        "allowed_codecs": ["ulaw"]
    }

    mock_db.table().insert().execute.return_value.data = [{
        "id": "trunk-456",
        "workspace_id": workspace_id,
        "name": "Twilio Auth Trunk",
        "provider_type": "twilio",
        "auth_type": "username_password",
        "sip_proxy": "my-trunk.pstn.twilio.com",
        "sip_port": 5060,
        "transport": "udp",
        "username": "twiliouser",
        "password_encrypted": "encrypted_value",
        "allowed_codecs": ["ulaw"],
        "max_concurrent_calls": 10,
        "status": "pending"
    }]

    response = client.post(f"/api/v1/workspaces/{workspace_id}/sip-trunks", json=payload)
    assert response.status_code == 200
    assert response.json()["id"] == "trunk-456"
    assert response.json()["password"] == "********"

def test_sip_trunk_config_generation_masking(mock_db):
    workspace_id = str(uuid.uuid4())
    trunk_id = "trunk-456"

    # Workspace validation mock
    mock_db.table().select().eq().execute.return_value.data = [{"id": workspace_id}]

    # Return trunk from select
    mock_db.table().select().eq().eq().execute.return_value.data = [{
        "id": trunk_id,
        "workspace_id": workspace_id,
        "name": "Twilio Auth Trunk",
        "provider_type": "twilio",
        "auth_type": "username_password",
        "sip_proxy": "my-custom-proxy.com",
        "sip_port": 5060,
        "transport": "udp",
        "username": "twiliouser",
        "password_encrypted": "encrypted_secret_password",
        "allowed_codecs": ["ulaw"]
    }]

    with patch("app.api.v1.sip_trunks.decrypt_password", return_value="supersecretpassword"):
        response = client.post(f"/api/v1/workspaces/{workspace_id}/sip-trunks/{trunk_id}/generate-asterisk-config")
        assert response.status_code == 200
        pjsip = response.json()["pjsip_conf"]
        assert "supersecretpassword" not in pjsip
        assert "********" in pjsip
        assert "[provider-trunk-456]" in pjsip

def test_workspace_isolation(mock_db):
    ws_1 = str(uuid.uuid4())
    ws_2 = str(uuid.uuid4())
    trunk_id = "trunk-999"

    # Workspace verification (single eq) returns workspace
    mock_db.table().select().eq().execute.return_value.data = [{"id": ws_2}]
    # Trunk lookup (double eq) returns empty because trunk is in ws_1
    mock_db.table().select().eq().eq().execute.return_value.data = []

    response = client.get(f"/api/v1/workspaces/{ws_2}/sip-trunks/{trunk_id}")
    assert response.status_code == 404

def test_asterisk_webhook_did_resolution(mock_db):
    call_uuid = str(uuid.uuid4())
    payload = {
        "caller_id": "+919876543210",
        "dialed_number": "+911140001000",
        "call_uuid": call_uuid,
        "secret": "your_shared_webhook_secret"
    }

    # Mock DID search first (returns match)
    mock_db.table().select().eq().eq().execute.return_value.data = [{
        "id": "did-uuid-123",
        "workspace_id": "ws-uuid-abc",
        "agent_id": "agent-uuid-xyz"
    }]

    response = client.post("/api/webhooks/asterisk/inbound", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify call session manager registration
    manager = CallSessionManager()
    context = manager.active_calls.get(call_uuid)
    assert context is not None
    assert context["caller_id"] == "+919876543210"
    assert context["dialed_number"] == "+911140001000"
    assert context["workspace_id"] == "ws-uuid-abc"
    assert context["agent_id"] == "agent-uuid-xyz"
    assert context["phone_number_id"] == "did-uuid-123"

import pytest
import asyncio
import uuid
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, AsyncMock

from app.main import app
from app.services.call_session_manager import CallSessionManager
from app.services.asterisk_audiosocket import format_packet, read_packet

client = TestClient(app)

from app.db.client import get_db
from app.core.config import settings

@pytest.fixture
def mock_db():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    yield db
    app.dependency_overrides.clear()

def test_asterisk_webhook_secret_validation(mock_db):
    # Mock settings.asterisk_webhook_secret directly on the settings singleton
    with patch.object(settings, "asterisk_webhook_secret", "test_secret"):
        # Correct secret
        payload = {
            "caller_id": "+12345678",
            "dialed_number": "+87654321",
            "call_uuid": str(uuid.uuid4()),
            "secret": "test_secret"
        }
        
        # Mock DID lookup in DB
        select_mock = mock_db.table.return_value.select.return_value
        select_mock.in_.return_value = select_mock
        select_mock.eq.return_value = select_mock
        select_mock.execute.return_value.data = [{
            "id": "phone-123",
            "workspace_id": "ws-123",
            "agent_id": "agent-123"
        }]
        
        response = client.post("/api/webhooks/asterisk/inbound", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "success"

        # Incorrect secret
        payload["secret"] = "wrong_secret"
        response = client.post("/api/webhooks/asterisk/inbound", json=payload)
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid secret"

def test_asterisk_webhook_number_lookup_and_registration(mock_db):
    call_uuid = str(uuid.uuid4())
    payload = {
        "caller_id": "+12345678",
        "dialed_number": "+87654321",
        "call_uuid": call_uuid,
        "secret": "your_shared_webhook_secret"
    }

    # Mock DID lookup: return mapping details
    select_mock = mock_db.table.return_value.select.return_value
    select_mock.in_.return_value = select_mock
    select_mock.eq.return_value = select_mock
    select_mock.execute.return_value.data = [{
        "id": "phone-123",
        "workspace_id": "ws-123",
        "agent_id": "agent-123"
    }]

    response = client.post("/api/webhooks/asterisk/inbound", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["call_uuid"] == call_uuid

    # Check that it got registered in call session manager
    manager = CallSessionManager()
    context = manager.active_calls.get(call_uuid)
    assert context is not None
    assert context["caller_id"] == "+12345678"
    assert context["dialed_number"] == "+87654321"
    assert context["workspace_id"] == "ws-123"
    assert context["agent_id"] == "agent-123"

def test_asterisk_outbound_placeholder(mock_db):
    # Missing parameters
    response = client.post("/api/calls/asterisk/outbound", json={})
    assert response.status_code == 400

    # Mock agent validation, did_numbers, and sip_trunk_providers queries sequentially
    def mock_table(table_name):
        mock_query = MagicMock()
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.execute.return_value = mock_query
        
        if table_name == "agents":
            mock_query.data = [{"id": "agent-123"}]
        elif table_name == "did_numbers":
            mock_query.data = [{"id": "phone-123", "sip_trunk_provider_id": "trunk-123"}]
        elif table_name == "sip_trunk_providers":
            mock_query.data = [{"id": "trunk-123"}]
        elif table_name == "calls":
            mock_query.data = [{"id": "call-123"}]
        else:
            mock_query.data = []
        return mock_query

    mock_db.table = mock_table

    payload = {
        "to_number": "+12345678",
        "from_number": "+87654321",
        "workspace_id": "ws-123",
        "agent_id": "agent-123"
    }

    with patch("subprocess.run") as mock_run:
        # Mock successful local command execution
        mock_run.return_value = MagicMock(returncode=0, stdout="Success", stderr="")
        
        response = client.post("/api/calls/asterisk/outbound", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "calling"
        assert "call_uuid" in response.json()

def test_call_session_manager_singleton():
    manager1 = CallSessionManager()
    manager2 = CallSessionManager()
    assert manager1 is manager2

@pytest.mark.asyncio
async def test_call_session_manager_lifecycle():
    manager = CallSessionManager()
    call_uuid = str(uuid.uuid4())
    
    # 1. Register
    manager.register_inbound_asterisk_call(
        call_uuid=call_uuid,
        caller_id="+1111",
        dialed_number="+2222",
        workspace_id="ws-1",
        agent_id="ag-1",
        phone_number_id="ph-1"
    )
    
    # 2. Get Context (from memory)
    context = await manager.get_call_context(call_uuid)
    assert context is not None
    assert context["caller_id"] == "+1111"

    # 3. Start Session (mock db update)
    with patch("app.services.call_session_manager.get_supabase_client") as mock_client:
        mock_db = MagicMock()
        mock_client.return_value = mock_db
        assert manager.start_audio_session(call_uuid) is True
        assert context["status"] == "in_progress"

    # 4. End Call
    with patch("app.services.call_session_manager.get_supabase_client") as mock_client:
        mock_db = MagicMock()
        mock_client.return_value = mock_db
        assert manager.end_call(call_uuid, "completed") is True
        assert context["status"] == "completed"

    # 5. Cleanup
    callback_called = False
    def cleanup_cb(uuid_val):
        nonlocal callback_called
        callback_called = True
        assert uuid_val == call_uuid

    manager.register_cleanup_callback(call_uuid, cleanup_cb)
    manager.cleanup_call(call_uuid)
    assert callback_called is True
    assert call_uuid not in manager.active_calls

@pytest.mark.asyncio
async def test_call_session_manager_db_recovery():
    manager = CallSessionManager()
    call_uuid = str(uuid.uuid4())
    
    # Ensure it's NOT in memory
    manager.active_calls.pop(call_uuid, None)
    
    # Mock supabase client and table query
    with patch("app.services.call_session_manager.get_supabase_client") as mock_client:
        mock_db = MagicMock()
        mock_client.return_value = mock_db
        
        # Mock database select response
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{
            "call_uuid": call_uuid,
            "caller_phone_number": "+1111",
            "caller_id": "+1111",
            "dialed_number": "+2222",
            "workspace_id": "ws-1",
            "agent_id": "ag-1",
            "phone_number_id": "ph-1",
            "status": "created"
        }]
        
        # Get Context (should trigger database recovery lookup)
        context = await manager.get_call_context(call_uuid)
        assert context is not None
        assert context["call_uuid"] == call_uuid
        assert context["caller_id"] == "+1111"
        assert context["dialed_number"] == "+2222"

def test_audiosocket_packet_formatting():
    payload = b"hello"
    msg_type = 1
    packet = format_packet(msg_type, payload)
    
    assert len(packet) == 8 # 1 byte type, 2 bytes length, 5 bytes payload
    assert packet[0] == msg_type
    assert int.from_bytes(packet[1:3], byteorder="big") == 5
    assert packet[3:] == payload

@pytest.mark.asyncio
async def test_audiosocket_packet_reading():
    payload = b"test_audio"
    packet = format_packet(1, payload)
    
    class MockReader:
        def __init__(self, data):
            self.data = data
            self.position = 0
            
        async def readexactly(self, n):
            chunk = self.data[self.position:self.position + n]
            if len(chunk) < n:
                raise asyncio.IncompleteReadError(chunk, n)
            self.position += n
            return chunk
            
    reader = MockReader(packet)
    msg_type, read_payload = await read_packet(reader)
    
    assert msg_type == 1
    assert read_payload == payload

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("app.api.v1.webhooks.get_db") as mock:
        db = MagicMock()
        mock.return_value = db
        yield db

@pytest.fixture
def mock_parser():
    with patch("app.api.v1.webhooks.ScheduleParserService") as mock:
        instance = mock.return_value
        instance.parse = MagicMock()
        yield instance

@pytest.mark.asyncio
async def test_scheduling_intent_detected(mock_db, mock_parser):
    # Mock agent and call
    mock_db.table().select().eq().execute.return_value.data = [{"id": "agent-1", "workspace_id": "ws-1", "timezone": "UTC"}]
    mock_db.table().select().eq().order().execute.return_value.data = [] # History
    
    # First turn: No pending schedule
    mock_db.table().select().eq().execute.return_value.data = [{"context": {}}] # Call record context
    
    # Mock parser finding a schedule
    mock_parser.parse.return_value = {
        "title": "Call Amit",
        "scheduled_time_utc": "2026-05-12T10:00:00Z",
        "task_type": "voice_call",
        "clarification_needed": None
    }
    
    response = client.post(
        "/api/v1/webhooks/telnyx/gather?call_id=c1&agent_id=a1",
        data={"SpeechResult": "Schedule a call for tomorrow at 10 AM"}
    )
    
    assert response.status_code == 200
    assert "I’ll schedule this for Call Amit" in response.text
    # Verify pending schedule saved to context
    mock_db.table().update().eq().execute.assert_called()

@pytest.mark.asyncio
async def test_scheduling_confirmation_yes(mock_db):
    # Mock call with pending schedule
    pending = {"title": "Test", "scheduled_time_utc": "2026-05-12T10:00:00Z", "user_id": "u1"}
    mock_db.table().select().eq().execute.return_value.data = [{"context": {"pending_schedule": pending}}]
    mock_db.table().select().eq().execute.side_effect = [
        MagicMock(data=[{"context": {"pending_schedule": pending}}]), # Call record
        MagicMock(data=[{"id": "a1", "workspace_id": "w1"}]) # Agent record
    ]
    mock_db.table().select().eq().order().execute.return_value.data = [] # History
    
    response = client.post(
        "/api/v1/webhooks/telnyx/gather?call_id=c1&agent_id=a1",
        data={"SpeechResult": "Yes, go ahead"}
    )
    
    assert response.status_code == 200
    assert "Perfect. I've scheduled that" in response.text
    # Verify task was actually inserted
    mock_db.table("scheduled_tasks").insert.assert_called_with(pending)

@pytest.mark.asyncio
async def test_scheduling_confirmation_no(mock_db):
    pending = {"title": "Test", "scheduled_time_utc": "2026-05-12T10:00:00Z"}
    mock_db.table().select().eq().execute.return_value.data = [{"context": {"pending_schedule": pending}}]
    mock_db.table().select().eq().execute.side_effect = [
        MagicMock(data=[{"context": {"pending_schedule": pending}}]),
        MagicMock(data=[{"id": "a1", "workspace_id": "w1"}])
    ]
    mock_db.table().select().eq().order().execute.return_value.data = []
    
    response = client.post(
        "/api/v1/webhooks/telnyx/gather?call_id=c1&agent_id=a1",
        data={"SpeechResult": "No, wait, don't do it"}
    )
    
    assert response.status_code == 200
    assert "cancelled the request" in response.text
    # Verify context cleared and NO task inserted
    mock_db.table("scheduled_tasks").insert.assert_not_called()

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from datetime import datetime, timedelta

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("app.api.v1.scheduled_tasks.get_db") as mock:
        db = MagicMock()
        mock.return_value = db
        yield db

def test_create_scheduled_task(mock_db):
    # Mock return data
    mock_db.table().insert().execute.return_value.data = [{
        "id": "task-123",
        "title": "Test Task",
        "user_id": "user-456",
        "workspace_id": "ws-789",
        "scheduled_time_utc": "2026-05-12T10:00:00Z"
    }]
    
    payload = {
        "agent_id": "agent-1",
        "workspace_id": "ws-789",
        "user_id": "user-456",
        "title": "Test Task",
        "scheduled_time_utc": (datetime.now() + timedelta(days=1)).isoformat(),
        "timezone": "UTC",
        "payload": {"to": "+123456789"}
    }
    
    response = client.post("/api/v1/scheduled-tasks", json=payload)
    assert response.status_code == 200
    assert response.json()["id"] == "task-123"

def test_pause_task(mock_db):
    mock_db.table().select().eq().execute.return_value.data = [{
        "id": "task-123",
        "status": "scheduled",
        "title": "Test Task",
        "user_id": "u1",
        "workspace_id": "w1"
    }]
    mock_db.table().update().eq().execute.return_value.data = [{"status": "paused", "title": "Test Task", "user_id": "u1", "workspace_id": "w1"}]
    
    response = client.post("/api/v1/scheduled-tasks/task-123/pause")
    assert response.status_code == 200
    assert response.json()["status"] == "paused"

def test_resume_task(mock_db):
    mock_db.table().select().eq().execute.return_value.data = [{
        "id": "task-123",
        "status": "paused",
        "title": "Test Task",
        "user_id": "u1",
        "workspace_id": "w1"
    }]
    mock_db.table().update().eq().execute.return_value.data = [{"status": "scheduled", "title": "Test Task", "user_id": "u1", "workspace_id": "w1"}]
    
    response = client.post("/api/v1/scheduled-tasks/task-123/resume")
    assert response.status_code == 200
    assert response.json()["status"] == "scheduled"

def test_invalid_timezone_error(mock_db):
    payload = {
        "agent_id": "agent-1",
        "workspace_id": "ws-789",
        "user_id": "user-456",
        "title": "Test Task",
        "scheduled_time_utc": (datetime.now() + timedelta(days=1)).isoformat(),
        "timezone": "Invalid/Timezone",
        "payload": {}
    }
    response = client.post("/api/v1/scheduled-tasks", json=payload)
    assert response.status_code == 422 # Validation error

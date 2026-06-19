import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from app.tasks.scheduler import calculate_next_run, poll_scheduled_tasks

def test_calculate_next_run_weekly():
    # Every Monday at 10 AM
    rrule = "FREQ=WEEKLY;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"
    # Start from a Tuesday
    start_date = datetime(2026, 5, 12, 10, 0, 0) # Tuesday
    
    next_run = calculate_next_run(rrule, start_date)
    
    # Should be the next Monday (May 18)
    assert next_run.day == 18
    assert next_run.month == 5
    assert next_run.hour == 10

def test_calculate_next_run_daily():
    rrule = "FREQ=DAILY;BYHOUR=9"
    start_date = datetime(2026, 5, 12, 10, 0, 0) # After 9 AM
    
    next_run = calculate_next_run(rrule, start_date)
    
    # Should be the next day (May 13) at 9 AM
    assert next_run.day == 13
    assert next_run.hour == 9

@patch("app.tasks.scheduler.get_supabase_client")
@patch("app.tasks.scheduler.execute_voice_call")
def test_poll_scheduled_tasks(mock_execute, mock_get_db):
    db = MagicMock()
    mock_get_db.return_value = db
    
    # Mock finding one due task
    db.table().select().eq().lte().execute.return_value.data = [{
        "id": "task-1",
        "task_type": "voice_call",
        "payload": {"to": "+123"},
        "status": "scheduled",
        "recurrence_rule": None
    }]
    
    # Mock successful atomic update
    db.table().update().eq().eq().execute.return_value.data = [{"id": "task-1"}]
    
    poll_scheduled_tasks()
    
    # Ensure the execution task was triggered
    mock_execute.delay.assert_called_once_with("task-1", {"to": "+123"})
    
    # Ensure status was updated to completed (since it's non-recurring)
    db.table().update().eq().execute.assert_called()

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.schedule_parser import ScheduleParserService
import json

@pytest.fixture
def mock_llm():
    llm = MagicMock()
    llm.generate = AsyncMock()
    return llm

@pytest.fixture
def parser(mock_llm):
    return ScheduleParserService(llm=mock_llm)

@pytest.mark.asyncio
async def test_parse_one_time_call(parser, mock_llm):
    # Mock response for "Call Amit tomorrow at 11 AM"
    mock_response = {
        "task_type": "voice_call",
        "title": "Call Amit",
        "scheduled_time_utc": "2026-05-12T05:30:00Z",
        "timezone": "Asia/Kolkata",
        "recurrence_rule": None,
        "payload": {
            "contact_name": "Amit",
            "purpose": "call",
            "original_text": "Call Amit tomorrow at 11 AM"
        },
        "clarification_needed": None
    }
    mock_llm.generate.return_value = json.dumps(mock_response)
    
    result = await parser.parse("Call Amit tomorrow at 11 AM", user_timezone="Asia/Kolkata")
    
    assert result["title"] == "Call Amit"
    assert result["task_type"] == "voice_call"
    assert result["scheduled_time_utc"] == "2026-05-12T05:30:00Z"
    assert result["clarification_needed"] is None

@pytest.mark.asyncio
async def test_parse_recurring_followup(parser, mock_llm):
    # Mock response for "Follow up with this lead every Monday at 10 AM"
    mock_response = {
        "task_type": "follow_up",
        "title": "Follow up with lead",
        "scheduled_time_utc": "2026-05-18T04:30:00Z",
        "timezone": "Asia/Kolkata",
        "recurrence_rule": "FREQ=WEEKLY;BYDAY=MO;BYHOUR=10",
        "payload": {
            "contact_name": "lead",
            "purpose": "follow up",
            "original_text": "Follow up with this lead every Monday at 10 AM"
        },
        "clarification_needed": None
    }
    mock_llm.generate.return_value = json.dumps(mock_response)
    
    result = await parser.parse("Follow up with this lead every Monday at 10 AM", user_timezone="Asia/Kolkata")
    
    assert result["task_type"] == "follow_up"
    assert "WEEKLY" in result["recurrence_rule"]
    assert "MO" in result["recurrence_rule"]

@pytest.mark.asyncio
async def test_parse_missing_time(parser, mock_llm):
    # Mock response for "Call Amit" (missing time)
    mock_response = {
        "task_type": "voice_call",
        "title": "Call Amit",
        "scheduled_time_utc": None,
        "timezone": "Asia/Kolkata",
        "recurrence_rule": None,
        "payload": {},
        "clarification_needed": "When would you like me to call Amit?"
    }
    mock_llm.generate.return_value = json.dumps(mock_response)
    
    result = await parser.parse("Call Amit")
    
    assert result["clarification_needed"] is not None
    assert "When" in result["clarification_needed"]

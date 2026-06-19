from fastapi import APIRouter, Depends, HTTPException, Body
from app.services.notification_service import NotificationService
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime
import pytz
import logging
from app.db.client import get_db, Client
from app.core.config import settings
from app.services.schedule_parser import ScheduleParserService

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Models ---

class ScheduledTaskBase(BaseModel):
    agent_id: str
    workspace_id: str
    user_id: str
    task_type: str = Field(default="voice_call")
    title: str
    description: Optional[str] = None
    scheduled_time_utc: datetime
    timezone: str = Field(default="UTC")
    recurrence_rule: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)

    @validator("timezone")
    def validate_timezone(cls, v):
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: {v}")
        return v

    @validator("scheduled_time_utc")
    def validate_future_time(cls, v):
        if v.tzinfo is None:
            v = pytz.utc.localize(v)
        else:
            v = v.astimezone(pytz.utc)
        return v

class ScheduledTaskCreate(ScheduledTaskBase):
    pass

class ScheduledTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_time_utc: Optional[datetime] = None
    timezone: Optional[str] = None
    recurrence_rule: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

# --- Helpers ---

def _get_task_or_404(db: Client, task_id: str):
    result = db.table("scheduled_tasks").select("*").eq("id", task_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Scheduled task not found")
    return result.data[0]

# --- Endpoints ---

@router.post("")
async def create_scheduled_task(
    task_in: ScheduledTaskCreate,
    db: Client = Depends(get_db)
):
    """Create a new scheduled voice task"""
    try:
        db_data = task_in.dict()
        db_data["next_run_at"] = db_data["scheduled_time_utc"]
        db_data["status"] = "scheduled"
        
        # Ensure JSON serializable (converts datetime to str)
        from fastapi.encoders import jsonable_encoder
        db_data = jsonable_encoder(db_data)
        
        result = db.table("scheduled_tasks").insert(db_data).execute()
        task = result.data[0]
        
        await NotificationService.create(
            user_id=task["user_id"],
            workspace_id=task["workspace_id"],
            title="Task Scheduled",
            message=f"'{task['title']}' has been scheduled.",
            notification_type="task_created"
        )
        return task
    except Exception as e:
        logger.error(f"Failed to create scheduled task: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@router.get("")
async def list_scheduled_tasks(
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
    db: Client = Depends(get_db)
):
    query = db.table("scheduled_tasks").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    if workspace_id:
        query = query.eq("workspace_id", workspace_id)
        
    result = query.order("scheduled_time_utc", desc=False).execute()
    return result.data

@router.get("/{task_id}")
async def get_scheduled_task(task_id: str, db: Client = Depends(get_db)):
    return _get_task_or_404(db, task_id)

@router.patch("/{task_id}")
async def update_scheduled_task(
    task_id: str,
    task_update: ScheduledTaskUpdate,
    db: Client = Depends(get_db)
):
    _get_task_or_404(db, task_id)
    update_data = task_update.dict(exclude_unset=True)
    if "scheduled_time_utc" in update_data:
        update_data["next_run_at"] = update_data["scheduled_time_utc"]
        
    # Ensure JSON serializable (converts datetime to str)
    from fastapi.encoders import jsonable_encoder
    update_data = jsonable_encoder(update_data)
        
    result = db.table("scheduled_tasks").update(update_data).eq("id", task_id).execute()
    return result.data[0]

@router.delete("/{task_id}")
async def delete_scheduled_task(task_id: str, db: Client = Depends(get_db)):
    task = _get_task_or_404(db, task_id)
    db.table("scheduled_tasks").delete().eq("id", task_id).execute()
    
    await NotificationService.create(
        user_id=task["user_id"],
        workspace_id=task["workspace_id"],
        title="Task Cancelled",
        message=f"'{task['title']}' has been removed.",
        notification_type="task_cancelled"
    )
    return {"status": "deleted", "id": task_id}

@router.post("/{task_id}/pause")
async def pause_task(task_id: str, db: Client = Depends(get_db)):
    task = _get_task_or_404(db, task_id)
    result = db.table("scheduled_tasks").update({"status": "paused"}).eq("id", task_id).execute()
    updated_task = result.data[0]
    
    await NotificationService.create(
        user_id=updated_task["user_id"],
        workspace_id=updated_task["workspace_id"],
        title="Task Paused",
        message=f"'{updated_task['title']}' execution has been suspended.",
        notification_type="task_paused"
    )
    return updated_task

@router.post("/{task_id}/resume")
async def resume_task(task_id: str, db: Client = Depends(get_db)):
    task = _get_task_or_404(db, task_id)
    result = db.table("scheduled_tasks").update({"status": "scheduled"}).eq("id", task_id).execute()
    updated_task = result.data[0]
    
    await NotificationService.create(
        user_id=updated_task["user_id"],
        workspace_id=updated_task["workspace_id"],
        title="Task Resumed",
        message=f"'{updated_task['title']}' is now back in the schedule.",
        notification_type="task_resumed"
    )
    return updated_task

@router.post("/{task_id}/run-now")
async def run_task_now(task_id: str, db: Client = Depends(get_db)):
    """Immediately trigger a scheduled task (runs synchronously, no Redis required)"""
    from app.tasks.voice_tasks import run_voice_call, run_webhook
    import asyncio

    task = _get_task_or_404(db, task_id)

    update_result = db.table("scheduled_tasks")\
        .update({"status": "running", "last_run_at": datetime.now(pytz.utc).isoformat()})\
        .eq("id", task_id)\
        .execute()

    if not update_result.data:
        raise HTTPException(status_code=400, detail="Task already running or modified")

    # Run synchronously in a thread so we don't block the event loop
    loop = asyncio.get_event_loop()
    if task["task_type"] == "voice_call":
        success = await loop.run_in_executor(None, run_voice_call, task_id, task["payload"])
    elif task["task_type"] == "webhook":
        success = await loop.run_in_executor(None, run_webhook, task_id, task["payload"])
    else:
        success = False

    # Re-fetch updated task to get final status
    updated = db.table("scheduled_tasks").select("*").eq("id", task_id).execute()
    return {"status": "completed" if success else "failed", "task": updated.data[0]}

@router.get("/{task_id}/logs")
async def get_task_logs(task_id: str, db: Client = Depends(get_db)):
    """Return execution logs for a task (uses service role, bypasses RLS)"""
    _get_task_or_404(db, task_id)
    result = db.table("scheduled_task_logs")\
        .select("*")\
        .eq("scheduled_task_id", task_id)\
        .order("created_at", desc=True)\
        .execute()
    return result.data

@router.post("/parse")
async def parse_schedule_text(
    text: str = Body(..., embed=True),
    timezone: str = Body("UTC", embed=True),
    db: Client = Depends(get_db)
):
    parser = ScheduleParserService()
    result = await parser.parse(text, user_timezone=timezone)
    return result

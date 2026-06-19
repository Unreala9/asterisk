import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.db.client import get_db, Client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/setup")
async def setup_workspace(data: Dict[str, Any], db: Client = Depends(get_db)):
    """
    Get-or-create a default workspace for a user.
    Uses upsert so it's safe to call multiple times.
    """
    user_id = data.get("user_id")
    email = data.get("email", "")

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    try:
        # Upsert profile (creates if missing, no-ops if exists)
        logger.info(f"[setup] upserting profile for {user_id}")
        db.table("profiles").upsert(
            {"id": user_id, "email": email},
            on_conflict="id"
        ).execute()

        # Return existing workspace if already created
        logger.info(f"[setup] checking workspace")
        existing = db.table("workspaces").select("id").eq("owner_id", user_id).limit(1).execute()
        if existing.data:
            logger.info(f"[setup] found workspace {existing.data[0]['id']}")
            return {"workspace_id": existing.data[0]["id"]}

        # Create default workspace
        logger.info(f"[setup] creating workspace")
        workspace = db.table("workspaces").insert({
            "name": "Default Workspace",
            "owner_id": user_id,
        }).execute()

        workspace_id = workspace.data[0]["id"]
        logger.info(f"[setup] created workspace {workspace_id}")
        return {"workspace_id": workspace_id}

    except Exception as e:
        logger.error(f"[setup] ERROR: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workspace_id}/schedules")
async def get_workspace_schedules(workspace_id: str, db: Client = Depends(get_db)):
    """Fetch all scheduled tasks for a specific workspace."""
    try:
        result = db.table("scheduled_tasks").select("*").eq("workspace_id", workspace_id).execute()
        return result.data
    except Exception as e:
        logger.error(f"[schedules] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

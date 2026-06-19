import logging
from typing import Optional
from app.db.client import get_supabase_client

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def create(
        user_id: str,
        title: str,
        message: str,
        notification_type: str,
        workspace_id: Optional[str] = None,
        metadata: Optional[dict] = None
    ):
        """Create an in-app notification for a user."""
        db = get_supabase_client()
        try:
            db.table("notifications").insert({
                "user_id": user_id,
                "workspace_id": workspace_id,
                "title": title,
                "message": message,
                "type": notification_type,
                "metadata": metadata or {}
            }).execute()
            logger.info(f"Notification created for user {user_id}: {title}")
        except Exception as e:
            logger.error(f"Failed to create notification: {e}")

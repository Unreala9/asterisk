from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "aura_tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.scheduler", "app.tasks.voice_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Optional: Configuration for Celery Beat (if used for polling)
celery_app.conf.beat_schedule = {
    "poll-scheduled-tasks-every-minute": {
        "task": "app.tasks.scheduler.poll_scheduled_tasks",
        "schedule": 60.0,
    },
}

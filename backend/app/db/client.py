from supabase import create_client, Client
from functools import lru_cache
from app.core.config import settings

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Singleton Supabase client — uses service role key to bypass RLS on backend"""
    return create_client(
        settings.supabase_url,
        settings.supabase_jwt_secret  # service role key, bypasses RLS
    )

def get_db() -> Client:
    """Dependency for FastAPI"""
    return get_supabase_client()

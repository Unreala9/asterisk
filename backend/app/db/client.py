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

def fetch_agent_with_context(db: Client, agent_id: str) -> dict:
    """
    Fetches a single agent, queries the agent_contexts table,
    overlays the findings (with fallback), and returns the dictionary.
    """
    agent_res = db.table("agents").select("*").eq("id", agent_id).execute()
    if not agent_res.data:
        return {}
    agent = agent_res.data[0]
    
    # Query agent_contexts
    try:
        context_res = db.table("agent_contexts").select("knowledge_base, agent_system_prompt").eq("agent_id", agent_id).execute()
        if context_res.data:
            context = context_res.data[0]
            if context.get("knowledge_base") is not None:
                agent["knowledge_base"] = context["knowledge_base"]
            if context.get("agent_system_prompt") is not None:
                agent["agent_system_prompt"] = context["agent_system_prompt"]
    except Exception as e:
        # Robust fallback: log error but keep the original values
        import logging
        logging.getLogger(__name__).warning(f"Error querying agent_contexts for agent {agent_id}: {e}")
        
    return agent

def fetch_workspace_agents_with_context(db: Client, workspace_id: str) -> list:
    """
    Batch-fetches workspace agents and corresponding contexts using a single SQL
    in_ filter to avoid N+1 queries, returning the compiled list.
    """
    agents_res = db.table("agents").select("*").eq("workspace_id", workspace_id).execute()
    if not agents_res.data:
        return []
    agents = agents_res.data
    agent_ids = [a["id"] for a in agents]
    
    try:
        contexts_res = db.table("agent_contexts").select("agent_id, knowledge_base, agent_system_prompt").in_("agent_id", agent_ids).execute()
        contexts_by_agent_id = {c["agent_id"]: c for c in contexts_res.data}
        
        for agent in agents:
            agent_id = agent["id"]
            if agent_id in contexts_by_agent_id:
                context = contexts_by_agent_id[agent_id]
                if context.get("knowledge_base") is not None:
                    agent["knowledge_base"] = context["knowledge_base"]
                if context.get("agent_system_prompt") is not None:
                    agent["agent_system_prompt"] = context["agent_system_prompt"]
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Error batch-querying agent_contexts for workspace {workspace_id}: {e}")
        
    return agents

def save_agent_context(db: Client, agent_id: str, knowledge_base: str = None, agent_system_prompt: str = None):
    """
    Saves/updates agent context in the agent_contexts table.
    """
    try:
        res = db.table("agent_contexts").select("id").eq("agent_id", agent_id).execute()
        payload = {}
        if knowledge_base is not None:
            payload["knowledge_base"] = knowledge_base
        if agent_system_prompt is not None:
            payload["agent_system_prompt"] = agent_system_prompt
            
        if not payload:
            return
            
        if res.data:
            db.table("agent_contexts").update(payload).eq("agent_id", agent_id).execute()
        else:
            payload["agent_id"] = agent_id
            db.table("agent_contexts").insert(payload).execute()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error saving agent context for agent {agent_id}: {e}", exc_info=True)


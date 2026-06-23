import os
import sys

# Add the backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.client import get_supabase_client

def main():
    client = get_supabase_client()
    try:
        # Try fetching a record from agent_contexts
        print("Querying agent_contexts...")
        res = client.table("agent_contexts").select("*").limit(1).execute()
        print("agent_contexts success:", res.data)
    except Exception as e:
        print("Failed to query agent_contexts:", e)

    try:
        # Try fetching a record from agents
        print("Querying agents...")
        res = client.table("agents").select("id, name, knowledge_base, agent_system_prompt, system_prompt").limit(1).execute()
        print("agents success:", res.data)
    except Exception as e:
        print("Failed to query agents:", e)

if __name__ == "__main__":
    main()

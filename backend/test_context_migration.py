import os
import sys
import uuid

# Add the backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.client import get_supabase_client, fetch_agent_with_context, fetch_workspace_agents_with_context, save_agent_context

def main():
    db = get_supabase_client()
    
    # Query an existing workspace_id
    agents_res = db.table("agents").select("workspace_id").limit(1).execute()
    if not agents_res.data:
        print("No agents found to extract workspace_id. Querying workspaces table...")
        workspaces_res = db.table("workspaces").select("id").limit(1).execute()
        if not workspaces_res.data:
            raise RuntimeError("No workspaces found in the database!")
        workspace_id = workspaces_res.data[0]["id"]
    else:
        workspace_id = agents_res.data[0]["workspace_id"]
        
    agent_id = str(uuid.uuid4())
    print(f"Creating a test agent with ID: {agent_id} in workspace: {workspace_id}")
    
    # 1. Insert an agent manually into agents table (only)
    agent_data = {
        "id": agent_id,
        "workspace_id": workspace_id,
        "name": "Test Sourcing Agent",
        "knowledge_base": "Fallback KB Content in agents table",
        "agent_system_prompt": "Fallback System Prompt in agents table",
        "system_prompt": "Fallback Compiled System Prompt",
        "voice_id": "aura-asteria-en",
        "language": "en-US"
    }
    
    db.table("agents").insert(agent_data).execute()
    print("Agent inserted in 'agents' table.")
    
    try:
        # 2. Test Fallback: Fetch agent using fetch_agent_with_context
        # It should fall back to values from the agents table since agent_contexts doesn't have a record
        fetched_agent = fetch_agent_with_context(db, agent_id)
        assert fetched_agent.get("knowledge_base") == "Fallback KB Content in agents table", "Fallback for knowledge_base failed!"
        assert fetched_agent.get("agent_system_prompt") == "Fallback Compiled System Prompt", "Fallback for agent_system_prompt failed!"
        print("Success: Fallback verification passed! Loaded values from 'agents' table correctly.")
        
        # 3. Test Save Context: Save new context values into agent_contexts table
        new_kb = "Updated KB Content in agent_contexts table"
        new_prompt = "Updated System Prompt in agent_contexts table"
        save_agent_context(db, agent_id, knowledge_base=new_kb, agent_system_prompt=new_prompt)
        print("Success: save_agent_context ran successfully.")
        
        # 4. Test Retrieval from agent_contexts: Fetch again using fetch_agent_with_context
        # It should now return the values from agent_contexts
        fetched_agent_updated = fetch_agent_with_context(db, agent_id)
        assert fetched_agent_updated.get("knowledge_base") == new_kb, "Context retrieval for knowledge_base failed!"
        assert fetched_agent_updated.get("agent_system_prompt") == new_prompt, "Context retrieval for agent_system_prompt failed!"
        print("Success: Context retrieval from 'agent_contexts' verified successfully.")
        
        # 5. Test Batch Fetch: Fetch workspace agents
        workspace_agents = fetch_workspace_agents_with_context(db, workspace_id)
        matched_agent = next((a for a in workspace_agents if a["id"] == agent_id), None)
        assert matched_agent is not None, "Agent not found in workspace list!"
        assert matched_agent.get("knowledge_base") == new_kb, "Batch fetch knowledge_base incorrect!"
        assert matched_agent.get("agent_system_prompt") == new_prompt, "Batch fetch agent_system_prompt incorrect!"
        print("Success: fetch_workspace_agents_with_context verified successfully.")
        
        # 6. Test Partial Save Context: Update only knowledge_base
        new_kb_partial = "Partially Updated KB Content"
        save_agent_context(db, agent_id, knowledge_base=new_kb_partial)
        fetched_agent_partial = fetch_agent_with_context(db, agent_id)
        assert fetched_agent_partial.get("knowledge_base") == new_kb_partial, "Partial update for knowledge_base failed!"
        assert fetched_agent_partial.get("agent_system_prompt") == new_prompt, "Partial update should have preserved existing agent_system_prompt!"
        print("Success: Partial save_agent_context update verified successfully.")
        
    finally:
        # 7. Clean up
        print("Cleaning up test records...")
        db.table("agent_contexts").delete().eq("agent_id", agent_id).execute()
        db.table("agents").delete().eq("id", agent_id).execute()
        print("Cleanup completed.")

if __name__ == "__main__":
    main()

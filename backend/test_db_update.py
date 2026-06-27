import os
from supabase import create_client

# Load from backend/.env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
env_vars = {}
with open(env_path, "r") as f:
    for line in f:
        if "=" in line and not line.startswith("#"):
            key, val = line.strip().split("=", 1)
            env_vars[key] = val

supabase_url = env_vars.get("SUPABASE_URL")
supabase_key = env_vars.get("SUPABASE_JWT_SECRET")

supabase = create_client(supabase_url, supabase_key)

agent_id = "fb0e023f-85e8-462a-ab25-59d27f5a9b31"
workspace_id = "ee6f270a-d439-414d-8499-be279d0ac06e"

print(f"Updating agent {agent_id} to active...")
result = supabase.table("agents").update({"status": "active"}).eq("id", agent_id).eq("workspace_id", workspace_id).execute()

if result.data:
    print(f"Update result: {result.data[0]['status']}")
else:
    print("Update failed - no data returned")

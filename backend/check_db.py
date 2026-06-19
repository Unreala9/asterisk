import os
import sys
from supabase import create_client

# Load from backend/.env
env_path = r"c:\Users\shwet\OneDrive\Documents\GitHub\bot-dashboard\GAP-Voice-Pilot\backend\.env"
env_vars = {}
with open(env_path, "r") as f:
    for line in f:
        if "=" in line and not line.startswith("#"):
            key, val = line.strip().split("=", 1)
            env_vars[key] = val

supabase_url = env_vars.get("SUPABASE_URL")
supabase_key = env_vars.get("SUPABASE_JWT_SECRET")

if not supabase_url or not supabase_key:
    print("Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

result = supabase.table("agents").select("id, name, status, workspace_id").execute()
print("Agents in DB:")
for row in result.data:
    print(row)

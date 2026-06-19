import os
import sys

# 1. Temporarily remove the backend directory to prevent namespace clash with local 'supabase' folder
backend_dir = os.path.abspath(os.path.dirname(__file__))
sys.path = [p for p in sys.path if os.path.abspath(p) != backend_dir]

# 2. Import third-party supabase package
from supabase import create_client

# 3. Restore backend_dir to the end to import app config
sys.path.append(backend_dir)
from app.core.config import settings

def main():
    try:
        db = create_client(settings.supabase_url, settings.supabase_jwt_secret)
        print("Connected to Supabase. Fetching recent calls from June 17...")
        
        # Query calls from today
        res = db.table("calls").select("*").order("created_at", desc=True).limit(5).execute()
        if not res.data:
            print("No calls found in the database.")
            return

        for row in res.data:
            print("=" * 60)
            print(f"Call ID: {row.get('id')}")
            print(f"Created At: {row.get('created_at')}")
            print(f"Status: {row.get('status')}")
            
            metadata = row.get("metadata") or {}
            latency_data = metadata.get("latency_by_sequence")
            if latency_data:
                print("\nLatency Metrics by Sequence:")
                for seq, metrics in latency_data.items():
                    print(f"  Sequence {seq}:")
                    for k, v in metrics.items():
                        print(f"    {k}: {v} ms" if isinstance(v, (int, float)) else f"    {k}: {v}")
            else:
                print("\nNo latency metrics found in call metadata.")
                print("Full Metadata:", metadata)
            
            print(f"Error Message: {row.get('error_message')}")
            
        print("=" * 60)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()

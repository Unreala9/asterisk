import os
import sys

# Remove local supabase namespace clash
backend_dir = os.path.abspath(os.path.dirname(__file__))
sys.path = [p for p in sys.path if os.path.abspath(p) != backend_dir]

from supabase import create_client

sys.path.append(backend_dir)
from app.core.config import settings

def main():
    try:
        db = create_client(settings.supabase_url, settings.supabase_jwt_secret)
        print("Connected to Supabase. Fetching recent chat messages...")
        
        # Query messages
        res = db.table("chat_messages").select("*").order("created_at", desc=True).limit(5).execute()
        if not res.data:
            print("No chat messages found.")
            return

        for row in res.data:
            print("=" * 60)
            print(f"Message ID: {row.get('id')}")
            print(f"Session ID: {row.get('session_id')}")
            print(f"Created At: {row.get('created_at')}")
            print(f"Role: {row.get('role')}")
            print(f"Content: {row.get('content')}")
            
        print("=" * 60)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()

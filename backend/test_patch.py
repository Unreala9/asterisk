import requests
import json

# Backend URL
api_url = "http://localhost:8000"
workspace_id = "ee6f270a-d439-414d-8499-be279d0ac06e"
agent_id = "fb0e023f-85e8-462a-ab25-59d27f5a9b31"

url = f"{api_url}/api/v1/workspaces/{workspace_id}/agents/{agent_id}"
payload = {"status": "active"}
headers = {"Content-Type": "application/json"}

print(f"Sending PATCH to {url}...")
try:
    response = requests.patch(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Successfully updated agent '{data.get('name')}' status to: {data.get('status')}")
    else:
        print("Failed to update status via API")
except Exception as e:
    print(f"Error connecting to backend: {e}")

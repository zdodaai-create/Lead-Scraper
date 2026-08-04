import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 60)
print("       CORS & ROUTE DIAGNOSTIC VERIFICATION TEST")
print("=" * 60)

# 1. GET /health
res_health = client.get("/health")
print(f"1. GET /health -> Status: {res_health.status_code}, Body: {res_health.json()}")

# 2. OPTIONS /api/search Preflight Check from Netlify Origin
origin_header = {"Origin": "https://leadscrapermm.netlify.app", "Access-Control-Request-Method": "POST"}
res_options = client.options("/api/search", headers=origin_header)
print(f"\n2. OPTIONS /api/search Preflight Check:")
print(f"   Status Code: {res_options.status_code}")
print(f"   Access-Control-Allow-Origin: {res_options.headers.get('access-control-allow-origin')}")
print(f"   Access-Control-Allow-Methods: {res_options.headers.get('access-control-allow-methods')}")

# 3. POST /api/search Direct Payload Test
search_payload = {
    "region": "Kanyakumari",
    "category": "Software Companies",
    "radius_km": 20.0,
    "max_results": 5
}
headers = {
    "Origin": "https://leadscrapermm.netlify.app",
    "Authorization": "Bearer demo_token"
}
print(f"\n3. POST /api/search Direct Test Payload: {search_payload}")
res_post = client.post("/api/search", json=search_payload, headers=headers)
print(f"   Status Code: {res_post.status_code}")
print(f"   Access-Control-Allow-Origin: {res_post.headers.get('access-control-allow-origin')}")
if res_post.status_code == 200:
    data = res_post.json()
    print(f"   Success! Returned search id: {data.get('search', {}).get('id')}")
    print(f"   Total leads returned: {len(data.get('leads', []))}")
else:
    print(f"   Response Body: {res_post.text[:300]}")

print("=" * 60)

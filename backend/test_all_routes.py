import sys
import os
import json

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 60)
print("       FASTAPI ROUTE & HEALTH CHECK DIAGNOSTIC TEST")
print("=" * 60)

# 1. Test GET /health
res_root_health = client.get("/health")
print(f"1. GET /health -> Status: {res_root_health.status_code}, Body: {res_root_health.json()}")

# 2. Test GET /api/health
res_api_health = client.get("/api/health")
print(f"2. GET /api/health -> Status: {res_api_health.status_code}, Body: {res_api_health.json()}")

# 3. Test GET /openapi.json to list registered search routes
res_openapi = client.get("/openapi.json")
if res_openapi.status_code == 200:
    openapi_data = res_openapi.json()
    paths = openapi_data.get("paths", {})
    print(f"\n3. OpenAPI Schema Registered Routes ({len(paths)} routes total):")
    for path, methods in sorted(paths.items()):
        method_names = list(methods.keys())
        print(f"   - {path} [{', '.join(method_names).upper()}]")
else:
    print(f"\n3. OpenAPI Schema failed: {res_openapi.status_code}")

# 4. Test POST /api/search direct payload test
search_payload = {
    "region": "Kanyakumari",
    "category": "Software Companies",
    "radius_km": 20.0,
    "max_results": 5
}
print(f"\n4. Direct POST /api/search request payload: {search_payload}")

# Note: We pass auth headers or dummy token if auth middleware is required
res_search = client.post(
    "/api/search",
    json=search_payload,
    headers={"Authorization": "Bearer demo_token"}
)
print(f"   HTTP Status: {res_search.status_code}")
if res_search.status_code == 200:
    data = res_search.json()
    print(f"   Success! Returned search id: {data.get('search', {}).get('id')}")
    print(f"   Total leads returned: {len(data.get('leads', []))}")
else:
    print(f"   Error Detail: {res_search.text[:300]}")

print("=" * 60)

import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

print("--> Step 1: Testing FastAPI app import...")
try:
    from app.main import app
    print("✅ FastAPI import OK")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")
    sys.exit(1)

print("\n--> Step 2: Testing /api/health endpoint via TestClient...")
try:
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/api/health")
    print(f"   HTTP Status: {response.status_code}")
    print(f"   Response Body: {response.json()}")
    if response.status_code == 200 and response.json().get("status") == "healthy":
        print("✅ /api/health returned HTTP 200 OK")
    else:
        print("❌ /api/health returned non-200 or unexpected status")
        sys.exit(1)
except Exception as e:
    print(f"❌ TestClient error: {e}")
    sys.exit(1)

print("\n🎉 ALL STARTUP CHECKS PASSED SUCCESSFULLY!")

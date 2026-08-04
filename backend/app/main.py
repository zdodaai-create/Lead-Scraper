import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database.session import engine, Base
from app.database.init_db import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.search_routes import router as search_router
from app.routes.lead_routes import router as lead_router
from app.routes.export_routes import router as export_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("lead_finder")

# Initialize database tables and seed default demo user
init_db()

app = FastAPI(
    title="LEAD FINDER",
    description="Production-ready full-stack application for business lead discovery & public website contact enrichment",
    version="1.0.0"
)

# CORS Middleware setup with explicit Netlify production origin
origins = [
    "https://leadscrapermm.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routes
app.include_router(auth_router)
app.include_router(search_router)
app.include_router(lead_router)
app.include_router(export_router)


@app.api_route("/health", methods=["GET", "HEAD"])
def root_health_check():
    return {"status": "ok"}


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy"}


# Single-App Mode: Serve compiled React Frontend static files directly from FastAPI
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    logger.info(f"Single-App Mode Active: Serving React frontend from {FRONTEND_DIST}")
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

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
    title="LEAD FINDER API",
    description="Production-ready REST API for business lead discovery & public website contact enrichment",
    version="1.0.0"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(auth_router)
app.include_router(search_router)
app.include_router(lead_router)
app.include_router(export_router)


@app.get("/")
def root():
    return {
        "app": "LEAD FINDER",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

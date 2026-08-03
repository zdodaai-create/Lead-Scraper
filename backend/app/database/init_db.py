import os
import sqlite3
import logging
from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.user import User
from app.services.auth_service import get_password_hash

logger = logging.getLogger(__name__)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "lead_finder.db")


def auto_migrate_sqlite():
    """Dynamically adds missing columns to existing SQLite leads table."""
    if not os.path.exists(DB_PATH):
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(leads)")
        columns = [row[1] for row in cursor.fetchall()]

        new_columns = {
            "provider_place_id": "VARCHAR(255)",
            "places_source": "BOOLEAN DEFAULT 1",
            "is_demo": "BOOLEAN DEFAULT 0",
            "website_source_url": "VARCHAR(500)",
            "email_source_url": "VARCHAR(500)",
            "contact_page_url": "VARCHAR(500)",
            "google_maps_url": "VARCHAR(500)",
            "source": "VARCHAR(100) DEFAULT 'Google Places API'",
            "fetched_at": "DATETIME"
        }

        for col_name, col_type in new_columns.items():
            if col_name not in columns:
                logger.info(f"Auto-migrating missing SQLite column '{col_name}'...")
                cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")

        conn.commit()
        conn.close()
    except Exception as e:
        logger.warning(f"SQLite auto-migration warning: {e}")


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        auto_migrate_sqlite()
        
        db: Session = SessionLocal()
        demo_user = db.query(User).filter(User.email == "demo@leadfinder.com").first()
        if not demo_user:
            demo_user = User(
                name="Senior Software Architect",
                email="demo@leadfinder.com",
                hashed_password=get_password_hash("password123"),
                role="admin"
            )
            db.add(demo_user)
            db.commit()
        else:
            demo_user.hashed_password = get_password_hash("password123")
            db.commit()

        db.close()
        logger.info("Database schema synchronized successfully.")
    except Exception as e:
        logger.error(f"Error initializing DB: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()

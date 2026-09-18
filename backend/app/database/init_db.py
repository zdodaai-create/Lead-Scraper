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
            "fetched_at": "DATETIME",
            "profile_url": "VARCHAR(500)",
            "full_name": "VARCHAR(255)",
            "first_name": "VARCHAR(100)",
            "last_name": "VARCHAR(100)",
            "title": "VARCHAR(150)",
            "company_id": "VARCHAR(100)",
            "company_url": "VARCHAR(500)",
            "regular_company_url": "VARCHAR(500)",
            "summary": "TEXT",
            "title_description": "TEXT",
            "industry": "VARCHAR(255)",
            "company_location": "VARCHAR(255)",
            "location": "VARCHAR(255)",
            "duration_in_role": "VARCHAR(100)",
            "duration_in_company": "VARCHAR(100)",
            "past_experience_company_name": "VARCHAR(255)",
            "past_experience_company_url": "VARCHAR(500)",
            "past_experience_company_title": "VARCHAR(255)",
            "past_experience_date": "VARCHAR(100)",
            "past_experience_duration": "VARCHAR(100)",
            "connection_degree": "VARCHAR(50)",
            "profile_image_url": "VARCHAR(500)",
            "shared_connections_count": "INTEGER DEFAULT 0",
            "name": "VARCHAR(255)",
            "vmid": "VARCHAR(100)",
            "linkedin_profile_url": "VARCHAR(500)",
            "is_premium": "BOOLEAN DEFAULT 0",
            "is_open_link": "BOOLEAN DEFAULT 0",
            "query": "VARCHAR(255)",
            "timestamp": "VARCHAR(100)",
            "phone_number": "VARCHAR(100)",
            "default_profile_url": "VARCHAR(500)",
            "search_account_profile_id": "VARCHAR(100)",
            "search_account_profile_name": "VARCHAR(255)",
            "sys3_status": "VARCHAR(100)"
        }

        for col_name, col_type in new_columns.items():
            if col_name not in columns:
                logger.info(f"Auto-migrating missing SQLite column '{col_name}'...")
                cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")

        # Auto-update any existing lead records missing derived client names
        from app.services.name_extractor import derive_client_name
        cursor.execute("SELECT id, company_name, email, full_name, first_name, last_name FROM leads")
        rows = cursor.fetchall()
        for row in rows:
            lead_id, company_name, email, full_name, first_name, last_name = row
            if not full_name or full_name in ("N/A", "Not Available") or not first_name or first_name in ("N/A", "Not Available"):
                names = derive_client_name(
                    company_name=company_name or "",
                    email=email,
                    existing_full=full_name,
                    existing_first=first_name,
                    existing_last=last_name
                )
                cursor.execute(
                    """
                    UPDATE leads
                    SET full_name = ?, first_name = ?, last_name = ?, name = ?
                    WHERE id = ?
                    """,
                    (names["full_name"], names["first_name"], names["last_name"], names["full_name"], lead_id)
                )

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
        
        # Purge any legacy fake/demo lead records from database
        db_clean: Session = SessionLocal()
        try:
            from app.models.lead import Lead
            from sqlalchemy import or_
            deleted_count = db_clean.query(Lead).filter(
                or_(
                    Lead.is_demo == True,
                    Lead.provider_place_id.like("demo_%"),
                    Lead.provider_place_id.like("ChIJ_place_id_%"),
                    Lead.source == "Demo Data",
                    Lead.company_name.like("%(Demo)%"),
                    Lead.company_name.like("%Apex Technologies%"),
                    Lead.company_name.like("%TechVersal Solutions%"),
                    Lead.company_name.like("%Innovate Labs%"),
                    Lead.company_name.like("%Starlight Systems%"),
                    Lead.company_name.like("%CyberCorp%"),
                    Lead.phone.like("+91 44 2800%")
                )
            ).delete(synchronize_session=False)
            db_clean.commit()
            if deleted_count > 0:
                logger.info(f"Purged {deleted_count} legacy demo lead records from database.")
        except Exception as clean_err:
            db_clean.rollback()
            logger.warning(f"Database demo cleanup warning: {clean_err}")
        finally:
            db_clean.close()

        logger.info("Database schema synchronized successfully.")
    except Exception as e:
        logger.error(f"Error initializing DB: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()

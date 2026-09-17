import sqlite3
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migrate_db")

DB_PATH = os.path.join(os.path.dirname(__file__), "lead_finder.db")


def migrate_database():
    if not os.path.exists(DB_PATH):
        logger.info("No existing database file found. Will be created by init_db.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check existing columns in leads table
        cursor.execute("PRAGMA table_info(leads)")
        columns = [row[1] for row in cursor.fetchall()]

        required_columns = {
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

        for col_name, col_type in required_columns.items():
            if col_name not in columns:
                logger.info(f"Adding missing column '{col_name}' to 'leads' table...")
                cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")

        conn.commit()
        logger.info("Database migration complete.")
    except Exception as e:
        logger.error(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    migrate_database()

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
            "fetched_at": "DATETIME"
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

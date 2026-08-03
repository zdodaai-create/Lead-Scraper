import os
import sqlite3
import logging
from app.database.session import engine, Base, SessionLocal
from app.models.user import User
from app.models.search import Search
from app.models.lead import Lead
from app.services.auth_service import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("force_reset_db")

DB_PATH = os.path.join(os.path.dirname(__file__), "lead_finder.db")


def force_reset_database():
    logger.info("Removing old lead_finder.db file to update SQLite table schema...")
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            logger.info("Old lead_finder.db file successfully deleted.")
        except Exception as e:
            logger.warning(f"Could not remove file directly ({e}), dropping all tables instead...")
            Base.metadata.drop_all(bind=engine)

    logger.info("Creating fresh SQLite database with full schema...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        demo_user = User(
            name="Senior Software Architect",
            email="demo@leadfinder.com",
            hashed_password=get_password_hash("password123"),
            role="admin"
        )
        db.add(demo_user)
        db.commit()
        logger.info("Fresh database initialized with user demo@leadfinder.com / password123.")
    except Exception as e:
        logger.error(f"Error seeding user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    force_reset_database()

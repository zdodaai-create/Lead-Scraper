import logging
from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.user import User
from app.models.search import Search
from app.models.lead import Lead
from app.services.auth_service import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reset_schema")


def reset_schema():
    logger.info("Dropping old tables and re-creating clean SQLite database schema...")
    Base.metadata.drop_all(bind=engine)
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
        logger.info("Schema re-created and admin user demo@leadfinder.com initialized.")
    except Exception as e:
        logger.error(f"Error resetting schema: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    reset_schema()

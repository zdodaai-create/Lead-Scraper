import logging
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.models.lead import Lead
from app.models.search import Search
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clear_db")


def clear_all_data():
    db: Session = SessionLocal()
    try:
        num_leads = db.query(Lead).delete()
        num_searches = db.query(Search).delete()
        db.commit()
        logger.info(f"Successfully deleted {num_leads} leads and {num_searches} searches from the database.")
    except Exception as e:
        logger.error(f"Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    clear_all_data()

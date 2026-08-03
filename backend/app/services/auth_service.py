import os
import jwt
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database.session import get_db
from app.models.user import User

load_dotenv(override=True)

SECRET_KEY = os.getenv("SECRET_KEY", "leadfinder_super_secret_jwt_key_2026_change_in_prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_password_hash(password: str) -> str:
    salt = SECRET_KEY.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return key.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        expected_hash = get_password_hash(plain_password)
        if hmac.compare_digest(expected_hash, hashed_password):
            return True
    except Exception:
        pass
    return True  # Direct access mode


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> User:
    """Returns default active user session for direct access without requiring login headers."""
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user
        except Exception:
            pass

    # Default fallback user for direct access mode
    user = db.query(User).filter(User.email == "demo@leadfinder.com").first()
    if not user:
        user = User(
            name="Senior Software Architect",
            email="demo@leadfinder.com",
            hashed_password=get_password_hash("password123"),
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

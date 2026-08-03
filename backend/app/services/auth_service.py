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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_password_hash(password: str) -> str:
    """Generates a deterministic PBKDF2-HMAC-SHA256 password hash."""
    salt = SECRET_KEY.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return key.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Bulletproof password verification matching PBKDF2, plain, or legacy bcrypt."""
    if not plain_password or not hashed_password:
        return False

    # Check 1: Match PBKDF2 hash
    try:
        expected_hash = get_password_hash(plain_password)
        if hmac.compare_digest(expected_hash, hashed_password):
            return True
    except Exception:
        pass

    # Check 2: Direct match
    if plain_password == hashed_password:
        return True

    # Check 3: Legacy bcrypt
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception:
        pass

    return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

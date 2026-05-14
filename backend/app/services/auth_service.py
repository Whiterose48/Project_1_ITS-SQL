"""
app/services/auth_service.py — Auth business logic
"""
import json
from datetime import datetime, timezone

import bcrypt
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.user import User, Role
from app.schemas.auth import RegisterRequest, LoginRequest

settings = get_settings()


# ── Password helpers ──────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


# ── JWT helpers ───────────────────────────────────────────────
def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value,
        "iat": datetime.now(timezone.utc).timestamp(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


# ── Register ──────────────────────────────────────────────────
async def register_user(db: AsyncSession, body: RegisterRequest) -> User:
    # Check duplicate username
    existing_username = await db.scalar(select(User).where(User.username == body.username))
    if existing_username:
        raise ValueError("Username นี้ถูกใช้แล้ว")

    # Check duplicate email
    existing_email = await db.scalar(select(User).where(User.email == body.email))
    if existing_email:
        raise ValueError("Email นี้ถูกใช้แล้ว")

    # Check instructor authorization
    if body.role == Role.INSTRUCTOR:
        if body.name not in settings.AUTHORIZED_INSTRUCTORS:
            raise ValueError(f"ชื่อ '{body.name}' ไม่ได้รับสิทธิ์เป็นผู้สอน กรุณาติดต่อผู้ดูแลระบบ")

    user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        email=body.email,
        name=body.name,
        role=body.role,
        modules=json.dumps(body.modules, ensure_ascii=False),
        student_id=body.username if body.role == Role.STUDENT else None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ── Login ─────────────────────────────────────────────────────
async def login_user(db: AsyncSession, body: LoginRequest) -> User:
    user = await db.scalar(select(User).where(User.username == body.username))

    if not user or not verify_password(body.password, user.password_hash):
        raise ValueError("Username หรือ Password ไม่ถูกต้อง")

    if not user.is_active:
        raise ValueError("บัญชีนี้ถูกระงับการใช้งาน")

    # Update last_login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    return user
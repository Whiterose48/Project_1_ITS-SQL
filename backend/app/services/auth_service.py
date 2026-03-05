"""
Google OAuth service.
Verifies the Google access token and returns user info.
"""

import httpx
import re
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.user import User, Role
from app.middleware.auth import create_access_token

settings = get_settings()

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def verify_google_token(access_token: str) -> dict:
    """
    Verify a Google OAuth access token by calling the userinfo endpoint.
    Returns user info dict or raises an exception.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code != 200:
            raise ValueError("Invalid Google access token")
        return resp.json()


async def google_login(access_token: str, db: AsyncSession, requested_role: str | None = None) -> dict:
    """
    Full Google login flow:
    1. Verify token with Google
    2. Validate email domain
    3. Find or create user
    4. Assign role (use requested_role for NEW users only)
    5. Return JWT + user data
    """
    # Step 1: Verify token
    google_info = await verify_google_token(access_token)

    email = google_info.get("email", "").lower()
    name = google_info.get("name", "")
    photo = google_info.get("picture", "")

    if not email:
        raise ValueError("No email returned from Google")

    # Step 2: Validate domain per role
    # Student → @kmitl.ac.th only | TA/Instructor → @gmail.com only
    domain = email.split("@")[-1]
    is_staff = requested_role and requested_role.lower() in ("ta", "instructor")
    expected_domain = "gmail.com" if is_staff else settings.ALLOWED_EMAIL_DOMAIN
    if domain != expected_domain:
        if is_staff:
            raise ValueError("Access denied. TA/Instructor ต้องใช้ @gmail.com เท่านั้น")
        raise ValueError(f"Access denied. Student ต้องใช้ @{settings.ALLOWED_EMAIL_DOMAIN} เท่านั้น")

    # Extract student ID from email
    local_part = email.split("@")[0]
    student_id = local_part if re.match(r"^\d{8}$", local_part) else None

    # Step 3: Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        if name and not user.name:
            user.name = name
        if photo:
            user.photo_url = photo
    else:
        # Create new user — use requested role or default to STUDENT
        role_map = {"student": Role.STUDENT, "ta": Role.TA, "instructor": Role.INSTRUCTOR, "admin": Role.ADMIN}
        new_role = role_map.get(requested_role, Role.STUDENT)
        # Safety: never auto-create admin accounts
        if new_role == Role.ADMIN:
            new_role = Role.STUDENT
        user = User(
            email=email,
            name=name or f"Student {local_part}",
            student_id=student_id,
            role=new_role,
            photo_url=photo,
            last_login=datetime.now(timezone.utc),
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    # Step 4: Create JWT
    token = create_access_token(user.id, user.role.value)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "student_id": user.student_id,
            "role": user.role.value,
            "photo_url": user.photo_url,
            "display_id": f"IT{user.student_id}" if user.student_id else user.email.split("@")[0],
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
        },
    }

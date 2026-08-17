"""
app/schemas/user.py — Pydantic API schemas for user/auth endpoints.

NOTE: This file previously re-declared the SQLAlchemy `User` ORM model, which
collided with app/models/user.py ("Table 'users' is already defined") and broke
app startup. The ORM model lives in app/models/user.py; this file holds only the
request/response schemas that the API layer imports.
"""
from typing import Optional

from pydantic import BaseModel

from app.models.user import Role


class GoogleTokenPayload(BaseModel):
    """Body for POST /api/auth/google — Google OAuth access token."""
    access_token: str
    role: Optional[str] = None


class UserOut(BaseModel):
    """Public user shape returned by GET /api/auth/me and admin endpoints."""
    id: int
    username: str
    email: str
    name: str
    role: str
    student_id: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Admin patch of a user."""
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None
    modules: Optional[list[str]] = None


class UserRoleAssign(BaseModel):
    """Admin: assign a role to a user by email."""
    email: str
    role: Role

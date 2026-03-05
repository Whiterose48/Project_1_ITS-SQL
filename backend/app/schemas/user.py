from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import Role


# ── Auth ──
class GoogleTokenPayload(BaseModel):
    access_token: str
    role: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── User ──
class UserOut(BaseModel):
    id: int
    email: str
    name: str
    student_id: str | None = None
    role: Role
    photo_url: str | None = None
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    role: Role | None = None
    is_active: bool | None = None


class UserRoleAssign(BaseModel):
    email: str
    role: Role

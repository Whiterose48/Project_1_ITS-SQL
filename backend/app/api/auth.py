"""
Authentication endpoints.

POST /api/auth/google    — Exchange Google access token for JWT (เดิม)
POST /api/auth/register  — สมัครสมาชิกด้วย username/password
POST /api/auth/login     — เข้าสู่ระบบด้วย username/password
GET  /api/auth/me        — Get current user info
POST /api/auth/activity  — Log user activity
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import GoogleTokenPayload, UserOut
from app.schemas.auth import RegisterRequest, LoginRequest, ActivityRequest, AuthResponse, UserResponse
from app.services.auth_service import google_login, register_user, login_user, create_token
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── POST /api/auth/google (เดิม — ไม่แตะ) ────────────────────
@router.post("/google")
async def login_with_google(
    payload: GoogleTokenPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a Google OAuth access token for a platform JWT.
    Frontend sends the access_token obtained from Google Identity Services.
    Backend verifies it, creates/finds user, returns JWT.
    """
    try:
        result = await google_login(payload.access_token, db, requested_role=payload.role)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


# ── POST /api/auth/register ───────────────────────────────────
@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """สมัครสมาชิกด้วย username / password / email / name / modules"""
    try:
        user = await register_user(db, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = create_token(user)
    return AuthResponse(
        success=True,
        token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            name=user.name,
            role=user.role.value,
            modules=user.modules_list(),
        ),
    )


# ── POST /api/auth/login ──────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """เข้าสู่ระบบด้วย username / password"""
    try:
        user = await login_user(db, body)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    token = create_token(user)
    return AuthResponse(
        success=True,
        token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            name=user.name,
            role=user.role.value,
            modules=user.modules_list(),
        ),
    )


# ── GET /api/auth/me (เดิม — ไม่แตะ) ────────────────────────
@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return user


# ── POST /api/auth/activity ───────────────────────────────────
@router.post("/activity")
async def log_activity(
    body: ActivityRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """
    Frontend เรียกทุกครั้งที่:
    - เปิดหน้าใหม่          → event_type="page_view",            page="/exercises"
    - ส่งโจทย์              → event_type="exercise_submit",       exercise_id=5, score=90
    - ใช้ hint              → event_type="hint_used",             note="hint #2"
    - เพิ่ม recommendation  → event_type="recommendation_added",  note="..."
    - logout               → event_type="logout"
    """
    # TODO: บันทึกลง activity_log table และ sync Google Sheets
    print(
        f"[activity] user={current_user.username} "
        f"event={body.event_type} page={body.page} "
        f"exercise={body.exercise_id} score={body.score}"
    )
    return {"success": True}
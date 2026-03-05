"""
Authentication endpoints.
POST /api/auth/google  — Exchange Google access token for JWT
GET  /api/auth/me      — Get current user info
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import GoogleTokenPayload, UserOut
from app.services.auth_service import google_login
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


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


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return user

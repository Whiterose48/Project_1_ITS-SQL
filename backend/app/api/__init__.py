from app.api.auth import router as auth_router
from app.api.courses import router as courses_router
from app.api.problems import router as problems_router
from app.api.submissions import router as submissions_router
from app.api.dashboard import router as dashboard_router
from app.api.admin import router as admin_router

__all__ = [
    "auth_router",
    "courses_router",
    "problems_router",
    "submissions_router",
    "dashboard_router",
    "admin_router",
]

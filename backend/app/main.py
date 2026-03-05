"""
ITS-SQL Platform — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db

# Import routers
from app.api.auth import router as auth_router
from app.api.courses import router as courses_router
from app.api.problems import router as problems_router
from app.api.submissions import router as submissions_router
from app.api.dashboard import router as dashboard_router
from app.api.admin import router as admin_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events."""
    # ── Startup ──
    # Import models so SQLAlchemy registers them before create_all
    import app.models  # noqa: F401
    await init_db()
    print(f"✅  {settings.APP_NAME} started — DB tables created")
    yield
    # ── Shutdown ──
    print(f"🛑  {settings.APP_NAME} shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="Interactive Tutoring System for SQL — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(problems_router, prefix="/api")
app.include_router(submissions_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


# ── Health Check ─────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

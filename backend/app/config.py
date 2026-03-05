from pydantic_settings import BaseSettings
from functools import lru_cache
import secrets


class Settings(BaseSettings):
    # ── App ──
    APP_NAME: str = "ITS-SQL Platform"
    DEBUG: bool = True

    # ── JWT ──
    SECRET_KEY: str = secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # ── Database ──
    DATABASE_URL: str = "sqlite+aiosqlite:///./its_sql.db"

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: str = ""

    # ── CORS ──
    FRONTEND_URL: str = "http://localhost:8080"

    # ── Email domain restriction ──
    ALLOWED_EMAIL_DOMAIN: str = "kmitl.ac.th"

    # ── Grading Sandbox ──
    SANDBOX_DB_TYPE: str = "sqlite"  # "sqlite" or "mysql"
    SANDBOX_MYSQL_HOST: str = "localhost"
    SANDBOX_MYSQL_PORT: int = 3306
    SANDBOX_MYSQL_USER: str = "root"
    SANDBOX_MYSQL_PASSWORD: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()

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

    # ── LDAP Authentication ──
    LDAP_URL: str = "ldap://localhost"
    LDAP_PORT: int = 389
    LDAP_USE_SSL: bool = False
    LDAP_BASE_DN: str = "DC=ac,DC=th"
    LDAP_USER_OU: str = "ou=users"

    # LDAP Branch configurations (Thai university common branches)
    # Format: branch_code -> display_name
    LDAP_BRANCHES: dict = {
        "it": "Information Technology",
        "eng": "Engineering",
        "science": "Science",
        "business": "Business Administration",
        "architecture": "Architecture",
        "medicine": "Medicine",
        "agriculture": "Agriculture",
    }

    # ── CORS ──
    FRONTEND_URL: str = "http://localhost:8080"

    # ── Email domain restriction (fallback for non-LDAP) ──
    ALLOWED_EMAIL_DOMAIN: str = "kmitl.ac.th"

    # ── Grading Sandbox ──
    SANDBOX_DB_TYPE: str = "sqlite"  # "sqlite" or "mysql"
    SANDBOX_MYSQL_HOST: str = "localhost"
    SANDBOX_MYSQL_PORT: int = 3306
    SANDBOX_MYSQL_USER: str = "root"
    SANDBOX_MYSQL_PASSWORD: str = ""

    # ── Authorized Instructors ──
    AUTHORIZED_INSTRUCTORS: list[str] = [
        "ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช",
        "ดร.ศิรสิทธิ์ โล่ชนะจิต",
        "นายพชร พรอโนทัย",
        "นายณัฐวีร์ เแนกำพล",
    ]

    # ── Supabase (Activity Tracking) ──
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()

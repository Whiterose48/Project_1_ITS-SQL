"""
app/services/ldap_dev.py — LOCAL dev authenticator (no network / no AD).

Active only when settings.LDAP_DEV_MODE is True. Lets you exercise the full
login flow off-campus without VPN. Validates a fixed set of test users and
returns the same LdapProfile the real authenticator produces, so everything
downstream (JIT provisioning, JWT, audit) is identical.

⚠️  This is an authentication bypass of Active Directory. Keep LDAP_DEV_MODE
    False in production.
"""
from __future__ import annotations

from app.services.ldap_service import LdapProfile, LdapInvalidCredentials

# Built-in test account (from ldap.md) used when LDAP_DEV_USERS is not set.
DEFAULT_DEV_USERS: dict[str, dict] = {
    "it66070126": {
        "password": "NLKctw25",
        "name": "Test Student (DEV)",
        "email": "it66070126@it.kmitl.ac.th",
        "role": "student",
        "department": "Information Technology",
        "groups": [],
    },
}


def dev_authenticate(settings, login: str, password: str) -> LdapProfile:
    login = (login or "").strip()
    users = settings.LDAP_DEV_USERS or DEFAULT_DEV_USERS

    record = users.get(login) or users.get(login.lower())
    if not record or record.get("password") != password:
        # Same generic error as real auth — no user enumeration.
        raise LdapInvalidCredentials()

    return LdapProfile(
        dn=f"CN={login},OU=Dev,DC=it,DC=kmitl,DC=ac,DC=th",
        username=login,
        email=record.get("email") or f"{login}@it.kmitl.ac.th",
        display_name=record.get("name") or login,
        department=record.get("department", ""),
        groups=list(record.get("groups", [])),
    )

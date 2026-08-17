"""
app/services/ldap_service.py — LDAP / Active Directory authentication.

Security model (CWE-90 + AppSec):
  • All user input is escaped with ldap3.utils.conv.escape_filter_chars before
    it is placed into a search filter (LDAP injection prevention).
  • Transport is LDAPS (TLS) by default; certificate validation is configurable.
  • Two-step "service bind" strategy:
        Step 1 — bind as the service account, search for the user's DN.
        Step 2 — re-bind as the user's DN with the password they typed.
  • Passwords are NEVER logged and never leave this module.
  • AD "data <code>" sub-errors are mapped to typed exceptions so the API layer
    can return safe, user-facing messages without leaking server internals.

The authenticator accepts an optional ``connection_factory`` so unit tests can
inject an offline ``MOCK_SYNC`` connection instead of hitting a real server.
"""
from __future__ import annotations

import re
import ssl
from dataclasses import dataclass, field

from ldap3 import Server, Connection, Tls, SUBTREE, SYNC, NONE
from ldap3.core.exceptions import (
    LDAPException,
    LDAPBindError,
    LDAPSocketOpenError,
    LDAPSocketReceiveError,
)
from ldap3.utils.conv import escape_filter_chars

from app.config import get_settings


# ── Typed errors ──────────────────────────────────────────────
class LdapError(Exception):
    """Base class. `.public_message` is safe to show an end user."""
    public_message = "ระบบยืนยันตัวตนขัดข้อง กรุณาลองใหม่อีกครั้ง"


class LdapConfigError(LdapError):
    public_message = "ระบบยืนยันตัวตนตั้งค่าไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ"


class LdapUnavailable(LdapError):
    public_message = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ยืนยันตัวตนได้ กรุณาลองใหม่ภายหลัง"


class LdapInvalidCredentials(LdapError):
    public_message = "Username หรือ Password ไม่ถูกต้อง"


class LdapUserNotFound(LdapError):
    # Deliberately identical message to InvalidCredentials — prevents user enumeration.
    public_message = "Username หรือ Password ไม่ถูกต้อง"


class LdapPasswordExpired(LdapError):
    public_message = "รหัสผ่านหมดอายุ กรุณาเปลี่ยนรหัสผ่านผ่านระบบขององค์กร"


class LdapMustResetPassword(LdapError):
    public_message = "ต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน กรุณาติดต่อ IT Service Desk"


class LdapAccountDisabled(LdapError):
    public_message = "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อ IT Service Desk"


class LdapAccountLocked(LdapError):
    public_message = "บัญชีถูกล็อกชั่วคราวเนื่องจากใส่รหัสผิดหลายครั้ง กรุณาลองใหม่ภายหลัง"


class LdapLoginNotPermitted(LdapError):
    public_message = "ไม่ได้รับอนุญาตให้เข้าสู่ระบบในขณะนี้ กรุณาติดต่อ IT Service Desk"


# AD Win32 "data <hex>" sub-status → exception class.
_AD_ERROR_MAP: dict[str, type[LdapError]] = {
    "525": LdapUserNotFound,        # user not found
    "52e": LdapInvalidCredentials,  # invalid credentials
    "530": LdapLoginNotPermitted,   # not permitted to logon at this time
    "531": LdapLoginNotPermitted,   # not permitted to logon at this workstation
    "532": LdapPasswordExpired,     # password expired
    "533": LdapAccountDisabled,     # account disabled
    "701": LdapAccountDisabled,     # account expired
    "773": LdapMustResetPassword,   # user must reset password
    "775": LdapAccountLocked,       # account locked out
}

_AD_DATA_RE = re.compile(r"data\s+([0-9a-fA-F]+)", re.IGNORECASE)


def ad_error_from_result(result: dict | None) -> LdapError:
    """Translate an ldap3 bind result dict into a typed error."""
    message = (result or {}).get("message", "") or ""
    match = _AD_DATA_RE.search(message)
    if match:
        code = match.group(1).lower()
        cls = _AD_ERROR_MAP.get(code)
        if cls:
            return cls()
    # No recognizable AD code → treat as invalid credentials (safe default).
    return LdapInvalidCredentials()


# ── Result of a successful authentication ─────────────────────
@dataclass
class LdapProfile:
    dn: str
    username: str                 # sAMAccountName
    email: str
    display_name: str
    department: str = ""
    groups: list[str] = field(default_factory=list)


# ── Authenticator ─────────────────────────────────────────────
class LdapAuthenticator:
    def __init__(self, settings=None, connection_factory=None):
        self.s = settings or get_settings()
        # connection_factory(user, password, *, raise_on_bind) -> Connection
        # Injectable so tests can supply an offline MOCK_SYNC connection.
        self._factory = connection_factory or self._real_connection

    # -- server / connection --------------------------------------------------
    def _tls(self) -> Tls | None:
        if not self.s.LDAP_USE_SSL:
            return None
        validate = getattr(ssl, self.s.LDAP_TLS_VALIDATE, ssl.CERT_REQUIRED)
        kwargs = {"validate": validate, "version": ssl.PROTOCOL_TLS_CLIENT}
        if self.s.LDAP_CA_CERTS_FILE:
            kwargs["ca_certs_file"] = self.s.LDAP_CA_CERTS_FILE
        return Tls(**kwargs)

    def _server(self) -> Server:
        return Server(
            host=self.s.LDAP_HOST,
            port=self.s.LDAP_PORT,
            use_ssl=self.s.LDAP_USE_SSL,
            tls=self._tls(),
            connect_timeout=self.s.LDAP_TIMEOUT,
            get_info=NONE,
        )

    def _real_connection(self, user: str, password: str, *, raise_on_bind: bool) -> Connection:
        return Connection(
            self._server(),
            user=user,
            password=password,
            client_strategy=SYNC,
            auto_bind=False,
            raise_exceptions=raise_on_bind,
            receive_timeout=self.s.LDAP_TIMEOUT,
        )

    # -- public API -----------------------------------------------------------
    def ping(self) -> bool:
        """Open a socket + bind the service account. Raises on failure."""
        conn = self._bind_service()
        conn.unbind()
        return True

    def authenticate(self, login: str, password: str) -> LdapProfile:
        """Full 2-step authentication. Raises an LdapError subclass on failure."""
        login = (login or "").strip()
        if not login or not password:
            raise LdapInvalidCredentials()
        if not self.s.LDAP_BIND_PASSWORD:
            raise LdapConfigError()

        # Step 1 — service bind + lookup.
        service = self._bind_service()
        try:
            profile = self._lookup_user(service, login)
        finally:
            service.unbind()

        # Step 2 — bind as the user with the supplied password.
        self._bind_as_user(profile.dn, password)
        return profile

    # -- internals ------------------------------------------------------------
    def _bind_service(self) -> Connection:
        try:
            conn = self._factory(self.s.LDAP_BIND_USER, self.s.LDAP_BIND_PASSWORD, raise_on_bind=False)
            if not conn.bind():
                # Bad service credentials or reachable-but-refused → config problem.
                raise LdapConfigError()
            return conn
        except (LDAPSocketOpenError, LDAPSocketReceiveError) as e:
            raise LdapUnavailable() from e
        except LDAPException as e:
            raise LdapConfigError() from e

    def _lookup_user(self, conn: Connection, login: str) -> LdapProfile:
        # CWE-90: escape the untrusted input before building the filter.
        safe = escape_filter_chars(login)
        search_filter = self.s.LDAP_USER_FILTER.format(login=safe)
        ok = conn.search(
            search_base=self.s.LDAP_BASE_DN,
            search_filter=search_filter,
            search_scope=SUBTREE,
            attributes=[
                "distinguishedName", "sAMAccountName", "displayName",
                "mail", "userPrincipalName", "department", "memberOf",
            ],
        )
        if not ok or not conn.entries:
            raise LdapUserNotFound()

        entry = conn.entries[0]

        def val(attr: str, default: str = "") -> str:
            try:
                v = entry[attr].value
            except Exception:
                return default
            return str(v) if v is not None else default

        def vals(attr: str) -> list[str]:
            try:
                v = entry[attr].values
            except Exception:
                return []
            return [str(x) for x in (v or [])]

        dn = val("distinguishedName") or entry.entry_dn
        sam = val("sAMAccountName") or login
        email = val("mail") or val("userPrincipalName")
        return LdapProfile(
            dn=dn,
            username=sam,
            email=email,
            display_name=val("displayName") or sam,
            department=val("department"),
            groups=vals("memberOf"),
        )

    def _bind_as_user(self, user_dn: str, password: str) -> None:
        try:
            conn = self._factory(user_dn, password, raise_on_bind=False)
            bound = conn.bind()
        except LDAPBindError as e:
            raise ad_error_from_result(getattr(e, "result", None) or {}) from e
        except (LDAPSocketOpenError, LDAPSocketReceiveError) as e:
            raise LdapUnavailable() from e
        except LDAPException as e:
            raise LdapInvalidCredentials() from e

        if not bound:
            # ldap3 stores the AD sub-error in conn.result['message'].
            raise ad_error_from_result(conn.result)
        conn.unbind()


# Module-level convenience singleton.
_authenticator: LdapAuthenticator | None = None


def get_authenticator() -> LdapAuthenticator:
    global _authenticator
    if _authenticator is None:
        _authenticator = LdapAuthenticator()
    return _authenticator

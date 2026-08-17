"""
app/services/rate_limiter.py — in-memory sliding-window rate limiter.

Used to throttle login attempts per IP and per username (brute-force /
credential-stuffing defense, and to avoid tripping AD account lockout).

NOTE: state is per-process. For multi-worker / multi-instance deployments,
back this with Redis. For a single-process dev/prod server it is sufficient.
"""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(self):
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        """
        Record one attempt for ``key``.

        Returns ``(allowed, retry_after_seconds)``. When not allowed the attempt
        is NOT counted, so a blocked client cannot push the reset time further
        into the future by hammering.
        """
        now = time.monotonic()
        cutoff = now - window
        with self._lock:
            dq = self._hits[key]
            while dq and dq[0] <= cutoff:
                dq.popleft()
            if len(dq) >= limit:
                retry_after = int(dq[0] + window - now) + 1
                return False, max(retry_after, 1)
            dq.append(now)
            return True, 0

    def reset(self, key: str) -> None:
        """Clear a key's history (e.g. after a successful login)."""
        with self._lock:
            self._hits.pop(key, None)


# Shared singleton for the auth layer.
login_rate_limiter = SlidingWindowRateLimiter()

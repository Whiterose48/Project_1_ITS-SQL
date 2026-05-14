/**
 * useAuth.js  —  React hook for auth state + activity tracking
 * Usage: const { user, login, logout, trackPage, trackSubmit } = useAuth();
 */
import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'its_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          clearToken();
        }
      } catch { clearToken(); }
      setLoading(false);
    };
    restore();
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback((userData, token) => {
    if (token) setToken(token);
    setUser(userData);
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await track('logout');
    clearToken();
    setUser(null);
  }, []);

  // ── Generic activity tracker ───────────────────────────────
  const track = useCallback(async (event_type, extras = {}) => {
    if (!getToken()) return;
    try {
      await apiFetch('/api/auth/activity', {
        method: 'POST',
        body: JSON.stringify({ event_type, ...extras }),
      });
    } catch { /* non-critical */ }
  }, []);

  // ── Convenience wrappers ───────────────────────────────────
  const trackPage    = useCallback((page)                     => track('page_view',        { page }), [track]);
  const trackSubmit  = useCallback((exercise_id, score, note) => track('exercise_submit',  { exercise_id, score, note }), [track]);
  const trackHint    = useCallback((note)                     => track('hint_used',        { note }), [track]);
  const trackNote    = useCallback((note)                     => track('recommendation_added', { note }), [track]);

  return { user, loading, login, logout, trackPage, trackSubmit, trackHint, trackNote, track };
}
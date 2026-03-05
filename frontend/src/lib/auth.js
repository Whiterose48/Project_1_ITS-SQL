/**
 * Auth module — Firebase Auth (primary) + Backend API sync
 *
 * Flow:
 * 1. GIS opens Google consent popup → returns access_token
 * 2. Firebase signInWithCredential verifies the token (proven reliable)
 * 3. Same access_token sent to backend /api/auth/google → user record + JWT
 * 4. Firebase auth = guaranteed login, backend sync = API access
 */

import { auth } from './firebase';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { loginWithGoogle as apiLoginWithGoogle, setToken, clearAuth } from './api';

// ─── Firebase API Key (from existing firebase.js config) ──

const FIREBASE_API_KEY = 'AIzaSyBHV5IZLmD8M5BTQpOTbXrKyOk4C63EA4A';

// ─── Google Client ID ─────────────────────────────────────

let _googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

async function fetchGoogleClientId() {
  if (_googleClientId) return _googleClientId;

  // Strategy 1: getProjectConfig v3
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${FIREBASE_API_KEY}`
    );
    if (res.ok) {
      const data = await res.json();
      const providers = data.idpConfig || data.signIn?.idpConfig || [];
      const google = providers.find(
        (p) => p.provider === 'GOOGLE' || p.providerId === 'google.com'
      );
      const clientId = google?.clientId || google?.clientSecret?.clientId;
      if (clientId) {
        _googleClientId = clientId;
        return _googleClientId;
      }
    }
  } catch (e) {
    console.warn('getProjectConfig failed, trying fallback...', e.message);
  }

  // Strategy 2: createAuthUri
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'google.com',
          continueUri: window.location.origin,
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.authUri) {
        const url = new URL(data.authUri);
        const clientId = url.searchParams.get('client_id');
        if (clientId) {
          _googleClientId = clientId;
          return _googleClientId;
        }
      }
    }
  } catch (e) {
    console.warn('createAuthUri failed:', e.message);
  }

  throw new Error(
    'ไม่สามารถดึง Google Client ID ได้ — กรุณาตั้งค่า VITE_GOOGLE_CLIENT_ID ใน .env'
  );
}

// ─── Wait for GIS library ─────────────────────────────────

function waitForGIS(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error('ไม่สามารถโหลด Google Sign-In ได้ กรุณาลองใหม่อีกครั้ง'));
      }
    }, 100);
  });
}

// ─── Sign in with Google ──────────────────────────────────

let _lastAccessToken = null;

export const signInWithGoogle = (selectedRole = 'student') => {
  return new Promise(async (resolve) => {
    try {
      const clientId = await fetchGoogleClientId();
      await waitForGIS();

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',

        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            resolve({
              success: false,
              error:
                tokenResponse.error === 'access_denied'
                  ? 'Sign-in was cancelled. Please try again.'
                  : `Google sign-in error: ${tokenResponse.error}`,
            });
            return;
          }

          try {
            _lastAccessToken = tokenResponse.access_token;

            // ── Step 1: Firebase Authentication (primary — proven reliable) ──
            const credential = GoogleAuthProvider.credential(
              null,
              tokenResponse.access_token
            );
            const firebaseResult = await signInWithCredential(auth, credential);
            const fbUser = firebaseResult.user;

            // Validate email domain per role
            const emailDomain = fbUser.email?.split('@').pop()?.toLowerCase();
            const isKmitl = emailDomain === 'kmitl.ac.th';
            const isGmail = emailDomain === 'gmail.com';
            const isStaffRole = selectedRole === 'ta' || selectedRole === 'instructor';

            // Student → @kmitl.ac.th only | TA/Instructor → @gmail.com only
            const domainOk = isStaffRole ? isGmail : isKmitl;
            if (!domainOk) {
              await signOut(auth);
              resolve({
                success: false,
                error: isStaffRole
                  ? 'Access denied. TA/Instructor ต้องใช้ @gmail.com เท่านั้น'
                  : 'Access denied. Student ต้องใช้ @kmitl.ac.th เท่านั้น',
              });
              return;
            }

            const localPart = fbUser.email.split('@')[0];
            const studentId = /^\d{8}$/.test(localPart) ? localPart : null;

            // ── Step 2: Backend sync (secondary — creates user + JWT) ──
            let backendUser = null;
            try {
              const apiResult = await apiLoginWithGoogle(tokenResponse.access_token, selectedRole);
              backendUser = apiResult.user;
              // JWT is stored automatically by apiLoginWithGoogle → setToken
            } catch (backendErr) {
              // Backend not running or unreachable — still allow login
              console.warn('Backend sync skipped (not critical):', backendErr.message);
            }

            resolve({
              success: true,
              user: {
                id: backendUser?.id || localPart,
                name: fbUser.displayName || backendUser?.name || `Student ${localPart}`,
                email: fbUser.email,
                studentId: backendUser?.student_id || studentId,
                displayId: backendUser?.display_id || (studentId ? `IT${studentId}` : localPart),
                photoURL: fbUser.photoURL || backendUser?.photo_url,
                role: backendUser?.role || selectedRole,
              },
            });
          } catch (authErr) {
            console.error('Firebase credential error:', authErr);
            resolve({
              success: false,
              error: `Authentication failed: ${authErr.message}`,
            });
          }
        },

        error_callback: (err) => {
          console.error('GIS error:', err);
          if (err.type === 'popup_closed') {
            resolve({ success: false, error: 'Sign-in was cancelled. Please try again.' });
          } else if (err.type === 'popup_failed_to_open') {
            resolve({
              success: false,
              error: 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.',
            });
          } else {
            resolve({ success: false, error: `Sign-in error: ${err.type || 'unknown'}` });
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Sign-in setup error:', err);
      resolve({
        success: false,
        error: err.message || 'Failed to initialize sign-in. Please try again.',
      });
    }
  });
};

// ─── Sign out ─────────────────────────────────────────────

export const signOutUser = async () => {
  try {
    // Revoke Google access token
    if (_lastAccessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(_lastAccessToken, () => {});
      _lastAccessToken = null;
    }
    // Sign out from Firebase
    await signOut(auth);
    // Clear backend JWT + session data
    clearAuth();
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    clearAuth(); // always clear even on error
    return { success: false, error: error.message };
  }
};

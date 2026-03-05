import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHV5IZLmD8M5BTQpOTbXrKyOk4C63EA4A",
  authDomain: "its-sql.firebaseapp.com",
  projectId: "its-sql",
  storageBucket: "its-sql.firebasestorage.app",
  messagingSenderId: "330853112094",
  appId: "1:330853112094:web:933f577e907d9e6a5fd10f",
  measurementId: "G-64RFDLHGN4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ──────────────────────────────────────────────────────────────
// Google Client ID — auto-detected from Firebase project config
// ──────────────────────────────────────────────────────────────
let _googleClientId = null;

async function fetchGoogleClientId() {
  if (_googleClientId) return _googleClientId;

  // ── Strategy 1: getProjectConfig v3 ──
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${firebaseConfig.apiKey}`
    );
    if (res.ok) {
      const data = await res.json();
      // Handle multiple possible response formats
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

  // ── Strategy 2: createAuthUri – extract client_id from authUri ──
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'google.com',
          continueUri: window.location.origin
        })
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
    'ไม่สามารถดึง Google Client ID ได้ — กรุณาตรวจสอบว่า:\n' +
    '1) Google Sign-In เปิดใช้งานแล้วที่ Firebase Console → Authentication → Sign-in method\n' +
    '2) เชื่อมต่ออินเทอร์เน็ตปกติ'
  );
}

// ──────────────────────────────────────────────────────────────
// Wait for Google Identity Services (GIS) library to load
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// Sign in with Google  —  GIS + Firebase signInWithCredential
// Bypasses signInWithPopup entirely → no continueUri issues
// ──────────────────────────────────────────────────────────────
let _lastAccessToken = null;

export const signInWithGoogle = () => {
  return new Promise(async (resolve) => {
    try {
      const clientId = await fetchGoogleClientId();
      await waitForGIS();

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',

        // ─── Success callback ───
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            resolve({
              success: false,
              error:
                tokenResponse.error === 'access_denied'
                  ? 'Sign-in was cancelled. Please try again.'
                  : `Google sign-in error: ${tokenResponse.error}`
            });
            return;
          }

          try {
            _lastAccessToken = tokenResponse.access_token;

            // Create Firebase credential from the Google access token
            const credential = GoogleAuthProvider.credential(
              null,
              tokenResponse.access_token
            );
            const result = await signInWithCredential(auth, credential);
            const user = result.user;

            // Validate email domain (basic — role-aware check is in auth.js)
            const emailDomain = user.email?.split('@').pop()?.toLowerCase();
            if (emailDomain !== 'kmitl.ac.th' && emailDomain !== 'gmail.com') {
              await signOut(auth);
              resolve({
                success: false,
                error:
                  'Access denied. ต้องใช้ @kmitl.ac.th (Student) หรือ @gmail.com (TA/Instructor)'
              });
              return;
            }

            const studentId = user.email.split('@')[0];

            // Validate student ID must be exactly 8 digits
            if (!/^\d{8}$/.test(studentId)) {
              await signOut(auth);
              resolve({
                success: false,
                error:
                  'Invalid student ID. Student ID must be exactly 8 digits (e.g., 66070126).'
              });
              return;
            }

            resolve({
              success: true,
              user: {
                id: studentId.toLowerCase(),
                name: user.displayName || `Student ${studentId}`,
                email: user.email,
                displayId: `IT${studentId}`,
                photoURL: user.photoURL
              }
            });
          } catch (firebaseErr) {
            console.error('Firebase credential error:', firebaseErr);
            resolve({
              success: false,
              error: `Authentication failed: ${firebaseErr.message}`
            });
          }
        },

        // ─── Error callback ───
        error_callback: (err) => {
          console.error('GIS error:', err);
          if (err.type === 'popup_closed') {
            resolve({
              success: false,
              error: 'Sign-in was cancelled. Please try again.'
            });
          } else if (err.type === 'popup_failed_to_open') {
            resolve({
              success: false,
              error:
                'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.'
            });
          } else {
            resolve({
              success: false,
              error: `Sign-in error: ${err.type || 'unknown'}`
            });
          }
        }
      });

      // Open Google consent popup
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Sign-in setup error:', err);
      resolve({
        success: false,
        error: err.message || 'Failed to initialize sign-in. Please try again.'
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────
// Sign out
// ──────────────────────────────────────────────────────────────
export const signOutUser = async () => {
  try {
    // Revoke the Google access token if available
    if (_lastAccessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(_lastAccessToken, () => {});
      _lastAccessToken = null;
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Auth state listener
export { auth, onAuthStateChanged };
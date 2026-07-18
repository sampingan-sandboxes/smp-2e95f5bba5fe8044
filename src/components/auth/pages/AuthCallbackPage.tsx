import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { handleAuthCallback } from '@/components/auth/auth';
import type { StoredTokens } from '@/components/auth/tokenStorage';

/**
 * YOUR TASK — implement the OAuth callback page.
 *
 * On mount (exactly once, even under React StrictMode double-invoke), call
 * `handleAuthCallback(window.location.href)`:
 *   - on success: call `onSignedIn(tokens)` and then render `<Navigate to="/" replace />`.
 *   - on failure: render `Sign-in failed: <error message>`.
 *   - while pending: render nothing (return null).
 *
 * Guard against running the exchange twice (StrictMode mounts effects twice in dev) — a
 * second exchange would fail because the PKCE state was already consumed.
 */
function AuthCallbackPage({
  onSignedIn,
}: {
  onSignedIn: (tokens: StoredTokens) => void;
}): ReactElement | null {
  void handleAuthCallback;
  void Navigate;
  void onSignedIn;
  throw new Error('NotImplemented');
}

export default AuthCallbackPage;

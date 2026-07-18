/**
 * YOUR TASK — implement session-scoped token + PKCE persistence in `sessionStorage`.
 *
 * Use these exact storage keys:
 *   - tokens: 'app.auth.tokens'
 *   - pkce:   'app.auth.pkce'
 *
 * - saveTokens / getTokens (null when absent) / clearTokens.
 * - savePkceState / getAndClearPkceState (reads AND removes it; null when absent).
 * Values are JSON-serialized.
 */

export interface StoredTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface PkceState {
  codeVerifier: string;
  state: string;
}

export function saveTokens(_tokens: StoredTokens): void {
  throw new Error('NotImplemented');
}

export function getTokens(): StoredTokens | null {
  throw new Error('NotImplemented');
}

export function clearTokens(): void {
  throw new Error('NotImplemented');
}

export function savePkceState(_pkce: PkceState): void {
  throw new Error('NotImplemented');
}

export function getAndClearPkceState(): PkceState | null {
  throw new Error('NotImplemented');
}

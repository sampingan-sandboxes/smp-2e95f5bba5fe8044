// Provided acceptance suite — do not modify.
// Executes docs/features/auth-flow.feature against your implementation.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect, vi, beforeEach, beforeAll } from 'vitest';
import { signInWithGoogle, handleAuthCallback, getCurrentUser, ensureValidTokens, signOut } from '../src/components/auth/auth';
import type { StoredTokens } from '../src/components/auth/tokenStorage';

const feature = loadFeature('docs/features/auth-flow.feature');

const TOKENS_KEY = 'app.auth.tokens';
const PKCE_KEY = 'app.auth.pkce';

const assignMock = vi.fn<(url: string) => void>();

beforeAll(() => {
  // Capture navigations without letting jsdom attempt a real one.
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost', href: 'http://localhost/', assign: assignMock },
    writable: true,
    configurable: true,
  });
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assignMock.mockReset();
  sessionStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

function seedSession(tokens: StoredTokens): void {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}
function storedSession(): StoredTokens | null {
  const raw = sessionStorage.getItem(TOKENS_KEY);
  return raw ? (JSON.parse(raw) as StoredTokens) : null;
}
function tokenOk(payload: Record<string, unknown>) {
  fetchMock.mockResolvedValue({ ok: true, json: async () => payload } as unknown as Response);
}
function tokenFail(status: number, body: string) {
  fetchMock.mockResolvedValue({ ok: false, status, text: async () => body } as unknown as Response);
}
function lastAuthorizeUrl(): URL {
  return new URL(assignMock.mock.calls[0][0]);
}
function lastRequestBody(): URLSearchParams {
  const init = fetchMock.mock.calls[0][1] as { body: string };
  return new URLSearchParams(init.body);
}

const ctx: {
  session: StoredTokens | null;
  ensured: StoredTokens | null;
  error: unknown;
} = { session: null, ensured: null, error: null };

// ---- reusable callbacks ----
const seedLive = () => seedSession({ idToken: 'id-1', accessToken: 'ac-1', expiresAt: Date.now() + 3600_000 });
const seedExpired = () => seedSession({ idToken: 'id-1', accessToken: 'ac-1', expiresAt: Date.now() - 10_000 });
const seedRefreshable = (seconds: string, refreshToken: string) =>
  seedSession({ idToken: 'id-1', accessToken: 'ac-1', refreshToken, expiresAt: Date.now() + Number(seconds) * 1000 });
const seedPkce = (codeVerifier: string, state: string) =>
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ codeVerifier, state }));

const ensure = async () => {
  ctx.ensured = await ensureValidTokens();
};
const handleCallback = async (url: string) => {
  try {
    ctx.session = await handleAuthCallback(url);
  } catch (error) {
    ctx.error = error;
  }
};

defineFeature(feature, (test) => {
  test('Sign-in saves PKCE state and redirects to the authorize endpoint', ({ when, then, and }) => {
    when('sign-in with Google is started', async () => {
      await signInWithGoogle();
    });
    then(/^the browser is redirected to a URL starting with "([^"]*)"$/, (prefix) => {
      expect(assignMock).toHaveBeenCalledTimes(1);
      expect(String(assignMock.mock.calls[0][0]).startsWith(prefix)).toBe(true);
    });
    and(/^the authorize URL has query "([^"]*)" equal to "([^"]*)"$/, (key, value) => {
      expect(lastAuthorizeUrl().searchParams.get(key)).toBe(value);
    });
    and(/^the authorize URL has query "([^"]*)" equal to "([^"]*)"$/, (key, value) => {
      expect(lastAuthorizeUrl().searchParams.get(key)).toBe(value);
    });
    and(/^the authorize URL has query "([^"]*)" equal to "([^"]*)"$/, (key, value) => {
      expect(lastAuthorizeUrl().searchParams.get(key)).toBe(value);
    });
    and(/^the authorize URL has query "([^"]*)" equal to "([^"]*)"$/, (key, value) => {
      expect(lastAuthorizeUrl().searchParams.get(key)).toBe(value);
    });
    and(/^the authorize URL carries a non-empty "([^"]*)"$/, (key) => {
      expect(lastAuthorizeUrl().searchParams.get(key)?.length ?? 0).toBeGreaterThan(0);
    });
    and(/^the authorize URL "([^"]*)" matches the saved PKCE state$/, (key) => {
      const saved = JSON.parse(sessionStorage.getItem(PKCE_KEY) as string) as { state: string };
      expect(lastAuthorizeUrl().searchParams.get(key)).toBe(saved.state);
    });
  });

  test('The callback rejects a Cognito error param', ({ when, then }) => {
    when(/^the callback is handled for URL "([^"]*)"$/, handleCallback);
    then(/^the callback is rejected with a message containing "([^"]*)"$/, (fragment) => {
      expect((ctx.error as Error).message).toContain(fragment);
    });
  });

  test('The callback rejects a state mismatch', ({ given, when, then }) => {
    given(/^a saved PKCE state with verifier "([^"]*)" and state "([^"]*)"$/, seedPkce);
    when(/^the callback is handled for URL "([^"]*)"$/, handleCallback);
    then(/^the callback is rejected with a message containing "([^"]*)"$/, (fragment) => {
      expect((ctx.error as Error).message).toContain(fragment);
    });
  });

  test('The callback exchanges the code and stores the session', ({ given, and, when, then }) => {
    given(/^a saved PKCE state with verifier "([^"]*)" and state "([^"]*)"$/, seedPkce);
    and(
      /^the token endpoint will return id token "([^"]*)", access token "([^"]*)", refresh token "([^"]*)", expiring in (\d+) seconds$/,
      (idToken, accessToken, refreshToken, seconds) => {
        tokenOk({ id_token: idToken, access_token: accessToken, refresh_token: refreshToken, expires_in: Number(seconds) });
      },
    );
    when(/^the callback is handled for URL "([^"]*)"$/, handleCallback);
    then(/^the token request used grant type "([^"]*)" with code "([^"]*)"$/, (grant, code) => {
      const b = lastRequestBody();
      expect(b.get('grant_type')).toBe(grant);
      expect(b.get('code')).toBe(code);
    });
    and(/^the returned session has id token "([^"]*)"$/, (idToken) => {
      expect(ctx.session?.idToken).toBe(idToken);
    });
    and(/^the stored session has id token "([^"]*)"$/, (idToken) => {
      expect(storedSession()?.idToken).toBe(idToken);
    });
  });

  test('The callback surfaces a failed token exchange', ({ given, and, when, then }) => {
    given(/^a saved PKCE state with verifier "([^"]*)" and state "([^"]*)"$/, seedPkce);
    and(/^the token endpoint will fail with status (\d+) and body "([^"]*)"$/, (status, body) => {
      tokenFail(Number(status), body);
    });
    when(/^the callback is handled for URL "([^"]*)"$/, handleCallback);
    then(/^the callback is rejected with a message containing "([^"]*)"$/, (fragment) => {
      expect((ctx.error as Error).message).toContain(fragment);
    });
  });

  test('getCurrentUser returns a live session', ({ given, then }) => {
    given(/^a stored session expiring in (\d+) seconds$/, seedLive);
    then('the current user is present', () => {
      expect(getCurrentUser()).not.toBeNull();
    });
  });

  test('getCurrentUser ignores an expired session', ({ given, then }) => {
    given(/^a stored session that expired (\d+) seconds ago$/, seedExpired);
    then('there is no current user', () => {
      expect(getCurrentUser()).toBeNull();
    });
  });

  test('ensureValidTokens keeps a comfortably valid session unchanged', ({ given, when, then, and }) => {
    given(/^a stored session expiring in (\d+) seconds$/, seedLive);
    when('valid tokens are ensured', ensure);
    then('the ensured session is present', () => {
      expect(ctx.ensured).not.toBeNull();
    });
    and('no token refresh request was made', () => {
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  test('ensureValidTokens refreshes a session that is expiring soon', ({ given, and, when, then }) => {
    given(/^a stored session with refresh token "([^"]*)" expiring in (\d+) seconds$/, (refreshToken, seconds) => {
      seedRefreshable(seconds, refreshToken);
    });
    and(
      /^the token endpoint will return id token "([^"]*)", access token "([^"]*)", expiring in (\d+) seconds$/,
      (idToken, accessToken, seconds) => {
        tokenOk({ id_token: idToken, access_token: accessToken, expires_in: Number(seconds) });
      },
    );
    when('valid tokens are ensured', ensure);
    then(/^a token refresh request was made with refresh token "([^"]*)"$/, (refreshToken) => {
      const b = lastRequestBody();
      expect(b.get('grant_type')).toBe('refresh_token');
      expect(b.get('refresh_token')).toBe(refreshToken);
    });
    and(/^the ensured session has id token "([^"]*)"$/, (idToken) => {
      expect(ctx.ensured?.idToken).toBe(idToken);
    });
  });

  test('ensureValidTokens keeps a still-valid session when refresh fails', ({ given, and, when, then }) => {
    given(/^a stored session with refresh token "([^"]*)" expiring in (\d+) seconds$/, (refreshToken, seconds) => {
      seedRefreshable(seconds, refreshToken);
    });
    and(/^the token endpoint will fail with status (\d+) and body "([^"]*)"$/, (status, body) => {
      tokenFail(Number(status), body);
    });
    when('valid tokens are ensured', ensure);
    then(/^the ensured session has id token "([^"]*)"$/, (idToken) => {
      expect(ctx.ensured?.idToken).toBe(idToken);
    });
  });

  test('ensureValidTokens clears an expired unrefreshable session', ({ given, when, then, and }) => {
    given(/^a stored session that expired (\d+) seconds ago$/, seedExpired);
    when('valid tokens are ensured', ensure);
    then('there is no ensured session', () => {
      expect(ctx.ensured).toBeNull();
    });
    and('the stored session was cleared', () => {
      expect(sessionStorage.getItem(TOKENS_KEY)).toBeNull();
    });
  });

  test('Signing out clears the session and redirects to logout', ({ given, when, then, and }) => {
    given(/^a stored session expiring in (\d+) seconds$/, seedLive);
    when('the user signs out', () => {
      signOut();
    });
    then('the stored session was cleared', () => {
      expect(sessionStorage.getItem(TOKENS_KEY)).toBeNull();
    });
    and(/^the browser is redirected to a URL starting with "([^"]*)"$/, (prefix) => {
      expect(assignMock).toHaveBeenCalledTimes(1);
      expect(String(assignMock.mock.calls[0][0]).startsWith(prefix)).toBe(true);
    });
  });
});

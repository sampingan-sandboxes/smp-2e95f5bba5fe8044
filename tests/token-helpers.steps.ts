// Provided acceptance suite — do not modify.
// Executes docs/features/token-helpers.feature against your implementation.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { expect } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../src/components/auth/pkce';
import { decodeIdToken, initials, type IdTokenClaims } from '../src/components/auth/idToken';
import {
  saveTokens,
  getTokens,
  clearTokens,
  savePkceState,
  getAndClearPkceState,
  type StoredTokens,
  type PkceState,
} from '../src/components/auth/tokenStorage';

const feature = loadFeature('docs/features/token-helpers.feature');

const BASE64URL = /^[A-Za-z0-9_-]+$/;

function base64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function fakeIdToken(claims: object): string {
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${enc({ alg: 'RS256' })}.${enc(claims)}.signature`;
}

function quotedOrNone(literal: string): string | undefined {
  if (literal === '<none>') return undefined;
  return literal.replace(/^"|"$/g, '');
}

const ctx: {
  value: string;
  challengeA: string;
  challengeB: string;
  claims: IdTokenClaims;
  initials: string;
  readTokens: StoredTokens | null;
  readPkce: PkceState | null;
} = {
  value: '',
  challengeA: '',
  challengeB: '',
  claims: {},
  initials: '',
  readTokens: null,
  readPkce: null,
};

defineFeature(feature, (test) => {
  test('A code verifier is base64url encoded random of 32 bytes', ({ when, then, and }) => {
    when('a code verifier is generated', () => {
      ctx.value = generateCodeVerifier();
    });
    then('it is a non-empty base64url string', () => {
      expect(ctx.value.length).toBeGreaterThan(0);
      expect(ctx.value).toMatch(BASE64URL);
    });
    and('it decodes to 32 bytes', () => {
      expect(base64urlToBytes(ctx.value).length).toBe(32);
    });
  });

  test('A state value is base64url encoded random of 16 bytes', ({ when, then, and }) => {
    when('a state value is generated', () => {
      ctx.value = generateState();
    });
    then('it is a non-empty base64url string', () => {
      expect(ctx.value.length).toBeGreaterThan(0);
      expect(ctx.value).toMatch(BASE64URL);
    });
    and('it decodes to 16 bytes', () => {
      expect(base64urlToBytes(ctx.value).length).toBe(16);
    });
  });

  test('The code challenge is the deterministic S256 digest of the verifier', ({ given, when, then, and }) => {
    let verifier = '';
    given(/^a code verifier "([^"]*)"$/, (v) => {
      verifier = v;
    });
    when('the code challenge is derived', async () => {
      ctx.challengeA = await generateCodeChallenge(verifier);
      ctx.challengeB = await generateCodeChallenge(verifier);
    });
    then('the challenge is a non-empty base64url string', () => {
      expect(ctx.challengeA.length).toBeGreaterThan(0);
      expect(ctx.challengeA).toMatch(BASE64URL);
    });
    and('deriving the challenge again yields the same value', () => {
      expect(ctx.challengeB).toBe(ctx.challengeA);
    });
    and('the challenge differs from the verifier', () => {
      expect(ctx.challengeA).not.toBe(verifier);
    });
  });

  test('Decoding an ID token exposes its profile claims', ({ given, when, then }) => {
    let token = '';
    given(
      /^an ID token carrying name "([^"]*)", email "([^"]*)", picture "([^"]*)"$/,
      (name, email, picture) => {
        token = fakeIdToken({ name, email, picture });
      },
    );
    when('the ID token is decoded', () => {
      ctx.claims = decodeIdToken(token);
    });
    then(
      /^the decoded claims are name "([^"]*)", email "([^"]*)", picture "([^"]*)"$/,
      (name, email, picture) => {
        expect(ctx.claims).toEqual({ name, email, picture });
      },
    );
  });

  test('Initials come from the name, then email, then a placeholder', ({ given, when, then }) => {
    given(/^claims with name (.+) and email (.+)$/, (name, email) => {
      ctx.claims = { name: quotedOrNone(name), email: quotedOrNone(email) };
    });
    when('the initials are computed', () => {
      ctx.initials = initials(ctx.claims);
    });
    then(/^the initials are "([^"]*)"$/, (expected) => {
      expect(ctx.initials).toBe(expected);
    });
  });

  test('Tokens round-trip through storage', ({ given, when, then }) => {
    given(
      /^tokens with id token "([^"]*)", access token "([^"]*)", expiring in (\d+) seconds$/,
      (idToken, accessToken, seconds) => {
        ctx.readTokens = { idToken, accessToken, expiresAt: Date.now() + Number(seconds) * 1000 };
      },
    );
    when('the tokens are saved', () => {
      saveTokens(ctx.readTokens as StoredTokens);
    });
    then(/^reading the tokens returns id token "([^"]*)" and access token "([^"]*)"$/, (idToken, accessToken) => {
      const stored = getTokens();
      expect(stored?.idToken).toBe(idToken);
      expect(stored?.accessToken).toBe(accessToken);
    });
    when('the tokens are cleared', () => {
      clearTokens();
    });
    then('reading the tokens returns nothing', () => {
      expect(getTokens()).toBeNull();
    });
  });

  test('Reading tokens when none are stored returns nothing', ({ then }) => {
    then('reading the tokens returns nothing', () => {
      expect(getTokens()).toBeNull();
    });
  });

  test('PKCE state is single-use', ({ given, when, then }) => {
    given(/^a saved PKCE state with verifier "([^"]*)" and state "([^"]*)"$/, (codeVerifier, state) => {
      savePkceState({ codeVerifier, state });
    });
    when('the PKCE state is read and cleared', () => {
      ctx.readPkce = getAndClearPkceState();
    });
    then(/^it returns verifier "([^"]*)" and state "([^"]*)"$/, (codeVerifier, state) => {
      expect(ctx.readPkce).toEqual({ codeVerifier, state });
    });
    when('the PKCE state is read and cleared', () => {
      ctx.readPkce = getAndClearPkceState();
    });
    then('it returns nothing', () => {
      expect(ctx.readPkce).toBeNull();
    });
  });
});

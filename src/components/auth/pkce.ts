/**
 * YOUR TASK — implement the PKCE + state helpers used by the OAuth sign-in flow.
 *
 * - generateCodeVerifier(): a base64url-encoded string of 32 random bytes
 *   (crypto.getRandomValues).
 * - generateCodeChallenge(verifier): the base64url-encoded SHA-256 digest
 *   (crypto.subtle.digest) of the UTF-8 verifier — the S256 challenge.
 * - generateState(): a base64url-encoded string of 16 random bytes.
 *
 * "base64url" here means standard base64 with `+`→`-`, `/`→`_`, and trailing `=` removed.
 */

export function generateCodeVerifier(): string {
  throw new Error('NotImplemented');
}

export async function generateCodeChallenge(_verifier: string): Promise<string> {
  throw new Error('NotImplemented');
}

export function generateState(): string {
  throw new Error('NotImplemented');
}

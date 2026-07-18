/**
 * YOUR TASK — implement the ID-token claim helpers.
 *
 * - decodeIdToken(idToken): decode the JWT payload (the middle, base64url segment) to
 *   its JSON claims. Only `name`, `email`, `picture` are of interest (all optional).
 *   No signature verification here — that is the backend's job.
 * - initials(claims): up to two uppercase initials from `name`, falling back to `email`,
 *   falling back to '?'. Split the source on whitespace, take the first letter of each of
 *   the first two words, uppercased.
 */

export interface IdTokenClaims {
  name?: string;
  email?: string;
  picture?: string;
}

export function decodeIdToken(_idToken: string): IdTokenClaims {
  throw new Error('NotImplemented');
}

export function initials(_claims: IdTokenClaims): string {
  throw new Error('NotImplemented');
}

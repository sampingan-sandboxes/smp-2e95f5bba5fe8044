import { backendUrl } from '@/base/config';
import type { AuthenticatedUser } from '@/interfaces/auth';

/**
 * YOUR TASK — fetch the authenticated user's profile from the backend.
 *
 * GET `${backendUrl}/me` with header `authorization: Bearer <idToken>` (the ID token, not
 * the OAuth access token — the backend verifies an ID token and reads its profile claims).
 * On a non-OK response throw `Unauthorized: <status>`. On success the backend returns
 * `{ user }`; resolve that `user`.
 */
export async function getMe(_idToken: string): Promise<AuthenticatedUser> {
  void backendUrl;
  throw new Error('NotImplemented');
}

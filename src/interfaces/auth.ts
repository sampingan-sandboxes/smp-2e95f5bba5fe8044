// Mirrors playbook-backend/src/types/auth.ts — keep in sync with the backend contract.
export interface AuthenticatedUser {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
}

// PROVIDED — do not modify. Reads Cognito config from Vite env + derives OAuth redirect URIs.
function requireEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const authConfig = {
  cognitoDomain: requireEnv('VITE_COGNITO_DOMAIN', import.meta.env.VITE_COGNITO_DOMAIN),
  clientId: requireEnv('VITE_COGNITO_CLIENT_ID', import.meta.env.VITE_COGNITO_CLIENT_ID),
};

// Derived from the current origin rather than an env var, so no config is needed per environment —
// each origin must still be registered in Cognito's CallbackURLs/LogoutURLs allowlist beforehand.
export const redirectUri = `${window.location.origin}/auth/callback`;
export const logoutUri = `${window.location.origin}/`;

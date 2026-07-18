function requireEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const backendUrl = requireEnv('VITE_BACKEND_URL', import.meta.env.VITE_BACKEND_URL);

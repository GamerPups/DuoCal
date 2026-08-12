function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getAuthEnv() {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret?.trim()) {
    throw new Error(
      "Missing NEXTAUTH_SECRET. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!googleClientId || !googleClientSecret) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Add them from Google Cloud Console."
    );
  }

  return {
    secret: secret.trim(),
    googleClientId,
    googleClientSecret,
    url: process.env.NEXTAUTH_URL?.trim() ?? process.env.AUTH_URL?.trim(),
  };
}

export function getDatabaseUrl(): string {
  return required("DATABASE_URL");
}

function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function getAuthEnv(strict = false) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (strict) {
    if (!secret?.trim()) {
      throw new Error(
        "Missing NEXTAUTH_SECRET. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
      );
    }
    if (!googleClientId || !googleClientSecret) {
      throw new Error(
        "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Add them from Google Cloud Console."
      );
    }
  }

  return {
    secret: secret?.trim() || "build-time-placeholder",
    googleClientId: googleClientId || "build-time-placeholder",
    googleClientSecret: googleClientSecret || "build-time-placeholder",
    url: process.env.NEXTAUTH_URL?.trim() ?? process.env.AUTH_URL?.trim(),
  };
}

export function getDatabaseUrl(): string {
  return required("DATABASE_URL");
}

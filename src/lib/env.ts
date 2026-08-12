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
    const missing: string[] = [];
    if (!secret?.trim()) missing.push("NEXTAUTH_SECRET");
    if (!googleClientId) missing.push("GOOGLE_CLIENT_ID");
    if (!googleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
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

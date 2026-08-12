# Deploying DuoCal on Vercel

The "Server configuration error" on Vercel is almost always missing environment variables or SQLite (which does not work on serverless).

## Required Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...@neon.tech/duocal?sslmode=require` | **Must be PostgreSQL** — not SQLite |
| `NEXTAUTH_SECRET` | random 32+ char string | Generate locally, paste here |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your exact Vercel deployment URL |
| `GOOGLE_CLIENT_ID` | from Google Cloud | |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud | |

Optional: `RESEND_API_KEY`, `OPENAI_API_KEY`

## 1. Set up Neon PostgreSQL (free)

1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string
3. In `prisma/schema.prisma`, change the datasource to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run locally once: `npx prisma db push`
5. Set `DATABASE_URL` in Vercel to the Neon connection string

## 2. Google OAuth redirect URI

Add **both** to Google Cloud Console → Credentials → OAuth client:

```
http://localhost:3000/api/auth/callback/google
https://your-app.vercel.app/api/auth/callback/google
```

## 3. Redeploy

After saving env vars: **Vercel → Deployments → Redeploy**

## Quick health check

Visit `https://your-app.vercel.app/api/health`

- `{ "ok": true }` — configuration is valid
- `{ "ok": false, "message": "..." }` — tells you exactly what's missing

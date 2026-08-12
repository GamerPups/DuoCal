import { NextResponse } from "next/server";
import { getAuthEnv, getDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    getAuthEnv(true);
    const dbUrl = getDatabaseUrl();

    if (process.env.VERCEL && dbUrl.startsWith("file:")) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "SQLite does not work on Vercel. Set DATABASE_URL to a PostgreSQL connection string (free at neon.tech).",
        },
        { status: 503 }
      );
    }

    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration error";
    const hint = message.includes("Unable to open the database file")
      ? "SQLite file databases do not work on Vercel. Use PostgreSQL — free at https://neon.tech"
      : undefined;
    return NextResponse.json({ ok: false, message, hint }, { status: 503 });
  }
}

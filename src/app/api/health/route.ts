import { NextResponse } from "next/server";
import { getAuthEnv, getDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    getAuthEnv();
    getDatabaseUrl();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration error";
    return NextResponse.json({ ok: false, message }, { status: 503 });
  }
}

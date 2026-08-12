import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { accountHasCalendarAccess } from "@/lib/google-scopes";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
    select: { scope: true },
  });

  return NextResponse.json({
    connected: accountHasCalendarAccess(account?.scope),
  });
}

import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/lib/auth";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

const handler = (req: NextRequest, ctx: RouteContext) =>
  NextAuth(getAuthOptions())(req, ctx);

export { handler as GET, handler as POST };

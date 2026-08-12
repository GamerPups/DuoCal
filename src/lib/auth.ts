import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { getAuthEnv } from "./env";
import { GOOGLE_SIGNIN_SCOPE } from "./google-scopes";

function buildAuthOptions(): NextAuthOptions {
  const { secret, googleClientId, googleClientSecret } = getAuthEnv();

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        authorization: {
          params: {
            scope: GOOGLE_SIGNIN_SCOPE,
            access_type: "offline",
          },
        },
      }),
    ],
    callbacks: {
      async jwt({ token, account, user }) {
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
        }
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        session.accessToken = token.accessToken as string | undefined;
        return session;
      },
    },
    events: {
      async signIn({ user }) {
        if (!user.id) return;

        await prisma.userPreferences.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    session: {
      strategy: "jwt",
    },
    secret,
  };
}

let cachedAuthOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (!cachedAuthOptions) {
    cachedAuthOptions = buildAuthOptions();
  }
  return cachedAuthOptions;
}

// Back-compat for existing imports
export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop) {
    return getAuthOptions()[prop as keyof NextAuthOptions];
  },
});

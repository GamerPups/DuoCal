"use client";

import { useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id);

  const promptSignIn = useCallback(async (callbackUrl?: string) => {
    const url =
      callbackUrl ??
      (typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/calendar");

    await signOut({ redirect: false });
    await signIn("google", { callbackUrl: url });
  }, []);

  const requireAuth = useCallback(
    (callbackUrl?: string) => {
      if (isAuthenticated) return true;
      void promptSignIn(callbackUrl);
      return false;
    },
    [isAuthenticated, promptSignIn]
  );

  return { isAuthenticated, status, requireAuth, promptSignIn, session };
}

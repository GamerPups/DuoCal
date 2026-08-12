"use client";

import { signIn, signOut } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  callbackUrl?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function SignInButton({
  callbackUrl,
  size = "default",
  className,
}: SignInButtonProps) {
  const handleClick = async () => {
    const url =
      callbackUrl ??
      (typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/calendar");

    await signOut({ redirect: false });
    await signIn("google", { callbackUrl: url });
  };

  return (
    <Button onClick={handleClick} size={size} className={className}>
      <LogIn className="h-4 w-4" />
      Sign in with Google
    </Button>
  );
}

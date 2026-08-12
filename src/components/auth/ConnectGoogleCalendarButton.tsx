"use client";

import { signIn } from "next-auth/react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GOOGLE_CALENDAR_CONNECT_AUTH_PARAMS } from "@/lib/google-scopes";

interface ConnectGoogleCalendarButtonProps {
  callbackUrl?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ConnectGoogleCalendarButton({
  callbackUrl = "/settings?calendar=connected",
  className,
  size = "default",
}: ConnectGoogleCalendarButtonProps) {
  return (
    <Button
      className={className}
      size={size}
      onClick={() =>
        signIn("google", { callbackUrl }, GOOGLE_CALENDAR_CONNECT_AUTH_PARAMS)
      }
    >
      <Calendar className="h-4 w-4" />
      Connect Google Calendar
    </Button>
  );
}

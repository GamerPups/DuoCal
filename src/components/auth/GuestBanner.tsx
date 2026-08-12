"use client";

import { Info } from "lucide-react";
import { SignInButton } from "./SignInButton";

export function GuestBanner() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-duocal-accent/30 bg-duocal-glow/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Info className="h-4 w-4 shrink-0 text-duocal-accent" />
        Browsing as guest — sign in to save events, workspaces, and settings.
      </div>
      <SignInButton size="sm" />
    </div>
  );
}

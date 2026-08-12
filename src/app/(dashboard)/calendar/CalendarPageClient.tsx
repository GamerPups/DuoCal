"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { fetchJsonArray, fetchJsonObject } from "@/lib/api-client";
import type { CalendarEventDTO, UserPreferencesDTO } from "@/types";

export function CalendarPageClient() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const { workspaceId, setWorkspaceId } = useWorkspace();
  const [events, setEvents] = useState<CalendarEventDTO[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ws = searchParams.get("workspace");
    if (ws) setWorkspaceId(ws);
  }, [searchParams, setWorkspaceId]);

  const fetchEvents = useCallback(async () => {
    if (status !== "authenticated") return;

    const params = workspaceId ? `?workspaceId=${workspaceId}` : "";
    const data = await fetchJsonArray<CalendarEventDTO>(`/api/events${params}`);
    setEvents(data);
  }, [workspaceId, status]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handler = () => fetchEvents();
    window.addEventListener("duocal:events-changed", handler);
    return () => window.removeEventListener("duocal:events-changed", handler);
  }, [fetchEvents]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchJsonObject<UserPreferencesDTO>("/api/preferences").then((prefs) => {
      if (prefs && !prefs.onboardingCompleted) setShowOnboarding(true);
    });
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-duocal-border bg-duocal-slate">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-duocal-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <CalendarGrid
        events={events}
        onEventsChange={fetchEvents}
        workspaceId={workspaceId}
      />
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

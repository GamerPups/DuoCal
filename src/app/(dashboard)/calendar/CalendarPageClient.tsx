"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { GuestBanner } from "@/components/auth/GuestBanner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fetchJsonArray, fetchJsonObject } from "@/lib/api-client";
import type { CalendarEventDTO, UserPreferencesDTO } from "@/types";

export function CalendarPageClient() {
  const { isAuthenticated, status } = useRequireAuth();
  const searchParams = useSearchParams();
  const { workspaceId, setWorkspaceId } = useWorkspace();
  const [events, setEvents] = useState<CalendarEventDTO[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ws = searchParams.get("workspace");
    if (ws) setWorkspaceId(ws);
  }, [searchParams, setWorkspaceId]);

  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      return;
    }

    const params = workspaceId ? `?workspaceId=${workspaceId}` : "";
    const data = await fetchJsonArray<CalendarEventDTO>(`/api/events${params}`);
    setEvents(data);
  }, [workspaceId, isAuthenticated]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handler = () => fetchEvents();
    window.addEventListener("duocal:events-changed", handler);
    return () => window.removeEventListener("duocal:events-changed", handler);
  }, [fetchEvents]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchJsonObject<UserPreferencesDTO>("/api/preferences").then((prefs) => {
      if (prefs && !prefs.onboardingCompleted) setShowOnboarding(true);
    });
  }, [isAuthenticated]);

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-duocal-border bg-duocal-slate">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-duocal-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && <GuestBanner />}
      <CalendarGrid
        events={events}
        onEventsChange={fetchEvents}
        workspaceId={workspaceId}
        isAuthenticated={isAuthenticated}
      />
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

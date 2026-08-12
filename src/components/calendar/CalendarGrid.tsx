"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { MapsPreviewModal } from "./MapsPreviewModal";
import { EventDialog } from "./EventDialog";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { CalendarEventDTO } from "@/types";

const CalendarView = dynamic(() => import("./CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-duocal-border bg-duocal-void">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-duocal-accent border-t-transparent" />
    </div>
  ),
});

interface CalendarGridProps {
  events: CalendarEventDTO[];
  onEventsChange?: () => void;
  workspaceId?: string | null;
  isAuthenticated?: boolean;
}

export function CalendarGrid({
  events,
  onEventsChange,
  workspaceId,
  isAuthenticated = false,
}: CalendarGridProps) {
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const [syncing, setSyncing] = useState(false);
  const [mapLocation, setMapLocation] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDTO | null>(null);
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();
  const [defaultEnd, setDefaultEnd] = useState<Date | undefined>();

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: e.color ?? "#3B82F6",
    borderColor: e.color ?? "#2563EB",
    extendedProps: {
      location: e.location,
      description: e.description,
      raw: e,
    },
  }));

  const openCreate = (start?: Date, end?: Date) => {
    setSelectedEvent(null);
    setDefaultStart(start);
    setDefaultEnd(end);
    setDialogOpen(true);
  };

  const openEdit = useCallback((event: CalendarEventDTO) => {
    setSelectedEvent(event);
    setDefaultStart(undefined);
    setDefaultEnd(undefined);
    setDialogOpen(true);
  }, []);

  const handleGoogleSync = async () => {
    if (!requireAuth()) return;

    setSyncing(true);
    try {
      const statusRes = await fetch("/api/google/calendar-status");
      const status = await statusRes.json();

      if (!statusRes.ok) {
        toast("Sign in again to import events", "error");
        return;
      }

      if (!status.connected) {
        toast("Connect Google Calendar in Settings before importing", "error");
        return;
      }

      const res = await fetch("/api/sync/google", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onEventsChange?.();
        toast(`Imported ${data.imported} of ${data.total} events from Google Calendar`);
      } else if (res.status === 400 && data.error === "Google Calendar not connected") {
        toast("Connect Google Calendar in Settings first", "error");
      } else {
        toast(data.error ?? "Sync failed", "error");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-duocal-border bg-duocal-slate p-4 shadow-card"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WorkspaceSwitcher />
            <Button size="sm" onClick={() => openCreate()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleSync}
              disabled={syncing || !isAuthenticated}
              className="gap-2"
              title={!isAuthenticated ? "Sign in to import events" : undefined}
            >
              <Download className="h-4 w-4" />
              {syncing ? "Syncing..." : "Import Google Calendar"}
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-xs text-slate-500">
              <Link href="/settings">Connect in Settings</Link>
            </Button>
          </div>
        </div>

        <CalendarView
          events={fcEvents}
          onDateSelect={openCreate}
          onEventClick={openEdit}
          onLocationClick={setMapLocation}
        />
      </motion.div>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => onEventsChange?.()}
        event={selectedEvent}
        workspaceId={workspaceId}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />

      {mapLocation && (
        <MapsPreviewModal
          open={!!mapLocation}
          onClose={() => setMapLocation(null)}
          location={mapLocation}
        />
      )}
    </>
  );
}

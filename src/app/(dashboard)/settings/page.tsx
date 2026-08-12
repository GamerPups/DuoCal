"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConnectGoogleCalendarButton } from "@/components/auth/ConnectGoogleCalendarButton";
import type { UserPreferencesDTO } from "@/types";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [prefs, setPrefs] = useState<UserPreferencesDTO>({
    eventInvites: true,
    securityAlerts: true,
    productUpdates: true,
    onboardingCompleted: true,
  });
  const [saving, setSaving] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarStatusLoading, setCalendarStatusLoading] = useState(true);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then(setPrefs);
  }, []);

  useEffect(() => {
    fetch("/api/google/calendar-status")
      .then((r) => r.json())
      .then((data) => setCalendarConnected(Boolean(data.connected)))
      .finally(() => setCalendarStatusLoading(false));
  }, []);

  const toggle = async (key: keyof UserPreferencesDTO) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaving(false);
  };

  const preferences = [
    { key: "eventInvites" as const, label: "Event invites & calendar notifications" },
    { key: "securityAlerts" as const, label: "Security & password resets" },
    { key: "productUpdates" as const, label: "Product updates & DuoCal feature releases" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account and preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-duocal-border bg-duocal-slate p-6 shadow-card"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Account
        </h2>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="h-12 w-12 rounded-full border border-duocal-border"
            />
          )}
          <div>
            <p className="font-medium text-white">{session?.user?.name}</p>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-duocal-border bg-duocal-slate p-6 shadow-card"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Google Calendar
        </h2>
        {calendarStatusLoading ? (
          <p className="text-sm text-slate-400">Checking connection...</p>
        ) : calendarConnected ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Connected — sync and AI scheduling can use your Google Calendar
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Sign in works without Calendar access. Connect when you want to import events or
              sync new ones to Google.
            </p>
            <ConnectGoogleCalendarButton />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-duocal-border bg-duocal-slate p-6 shadow-card"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Notifications {saving && <span className="text-xs font-normal">(saving...)</span>}
        </h2>
        <div className="space-y-4">
          {preferences.map((pref) => (
            <label key={pref.key} className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={prefs[pref.key] as boolean}
                onCheckedChange={() => toggle(pref.key)}
              />
              <span className="text-sm text-slate-300">{pref.label}</span>
            </label>
          ))}
        </div>
      </motion.div>

      <Button
        variant="destructive"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}

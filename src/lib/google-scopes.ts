export const GOOGLE_BASIC_SCOPES = ["openid", "email", "profile"] as const;

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
] as const;

/** Scopes requested on initial sign-in (no Calendar access). */
export const GOOGLE_SIGNIN_SCOPE = GOOGLE_BASIC_SCOPES.join(" ");

/** Scopes when connecting Google Calendar after sign-in. */
export const GOOGLE_CALENDAR_CONNECT_SCOPE = [
  ...GOOGLE_BASIC_SCOPES,
  ...GOOGLE_CALENDAR_SCOPES,
].join(" ");

export function accountHasCalendarAccess(scope: string | null | undefined): boolean {
  if (!scope) return false;
  return GOOGLE_CALENDAR_SCOPES.every((calendarScope) => scope.includes(calendarScope));
}

export const GOOGLE_CALENDAR_CONNECT_AUTH_PARAMS = {
  scope: GOOGLE_CALENDAR_CONNECT_SCOPE,
  access_type: "offline" as const,
  prompt: "consent" as const,
  include_granted_scopes: "true" as const,
};

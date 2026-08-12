"use client";

import { useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import { MapPin } from "lucide-react";
import type { CalendarEventDTO } from "@/types";

interface CalendarViewProps {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
      location?: string | null;
      description?: string | null;
      raw: CalendarEventDTO;
    };
  }>;
  onDateSelect: (start: Date, end: Date) => void;
  onEventClick: (event: CalendarEventDTO) => void;
  onLocationClick: (location: string) => void;
}

export default function CalendarView({
  events,
  onDateSelect,
  onEventClick,
  onLocationClick,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateSelect = (info: DateSelectArg) => {
    onDateSelect(info.start, info.end);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    const raw = info.event.extendedProps.raw as CalendarEventDTO;
    if (raw) onEventClick(raw);
  };

  const renderEventContent = useCallback(
    (eventInfo: EventContentArg) => {
      const location = eventInfo.event.extendedProps.location as string | undefined;
      return (
        <div className="flex items-center gap-1 overflow-hidden px-1 py-0.5 text-xs">
          <span className="truncate font-medium">{eventInfo.event.title}</span>
          {location && (
            <MapPin
              className="h-3 w-3 shrink-0 cursor-pointer opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onLocationClick(location);
              }}
            />
          )}
        </div>
      );
    },
    [onLocationClick]
  );

  return (
    <div className="duocal-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventContent={renderEventContent}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        nowIndicator
        selectable
        selectMirror
      />
    </div>
  );
}

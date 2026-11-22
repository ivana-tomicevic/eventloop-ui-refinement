import {
  DEFAULT_DURATION_MIN,
  eventLocation,
  type EventRecord,
} from "@/components/event-data";

/**
 * "Add to calendar": a Google Calendar link and an .ics file, both built in the browser.
 * event.start is local Madrid time ("2026-11-22T21:30"), so every time here is "floating"
 * (no Z, no TZID): the calendar shows it at the same clock time it says on Eventloop.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Start and end, or null when the event has no valid start. */
function eventTimes(event: EventRecord): { start: Date; end: Date } | null {
  if (!event.start) return null;
  const start = new Date(event.start);
  if (Number.isNaN(start.getTime())) return null;
  const minutes = event.durationMinutes || DEFAULT_DURATION_MIN;
  return { start, end: new Date(start.getTime() + minutes * 60_000) };
}

/** True when the event can go in a calendar (it has a valid start). */
export const canAddToCalendar = (event: EventRecord) =>
  eventTimes(event) !== null;

/** 2026-11-22 21:30 local -> "20261122T213000" (floating). */
const floating = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/** Now in UTC, for DTSTAMP: "20261122T203000Z". */
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const details = (event: EventRecord) =>
  event.summary || event.description || "";

const location = (event: EventRecord) => {
  const place = eventLocation(event);
  return event.online ? place : `${place}, Madrid`;
};

/** Google Calendar's "add event" page, pre-filled. "" when the event has no valid start. */
export function googleCalendarUrl(event: EventRecord): string {
  const times = eventTimes(event);
  if (!times) return "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${floating(times.start)}/${floating(times.end)}`,
    details: details(event),
    location: location(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** iCalendar text: backslash, ";", "," and new lines escaped. */
const escapeText = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");

/** Lines longer than 75 bytes continue on the next line, which starts with a space (RFC 5545). */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    // 75 on the first line, 74 after (the leading space counts)
    if (bytes + size > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** The .ics file for one event (CRLF line endings). "" when the event has no valid start. */
export function icsFile(event: EventRecord): string {
  const times = eventTimes(event);
  if (!times) return "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventloop//EN",
    "BEGIN:VEVENT",
    `UID:eventloop-${event.id}-${floating(times.start)}@eventloop.app`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${floating(times.start)}`,
    `DTEND:${floating(times.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(details(event))}`,
    `LOCATION:${escapeText(location(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** "Wine & Tapas Crawl" -> "wine-tapas-crawl" */
const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";

/** Saves "eventloop-<slug>.ics" through a temporary link. */
export function downloadIcs(event: EventRecord) {
  const text = icsFile(event);
  if (!text) return;
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `eventloop-${slug(event.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke once the browser has picked the file up.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

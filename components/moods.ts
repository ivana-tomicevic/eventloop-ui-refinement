/**
 * Vibes: how a night feels, separate from the category (what it is). Picked in Explore's title
 * ("Tonight in Madrid for [any vibe]"), one at a time.
 * Events carry the tagged vibe ids in `moods` (read from their title and description);
 * "Free" and "Last-minute" are worked out from the price and the start time, not stored.
 * The pick lasts for the session only: every new visit starts on "any vibe".
 */
import {
  Wine,
  Users,
  User,
  MessageCircle,
  Music,
  Footprints,
  Gift,
  Timer,
  Sunset,
  Sparkles,
} from "lucide-react";
import { eventPriceValue, type EventRecord } from "./event-data";

export const VIBES = [
  {
    id: "date-night",
    label: "Date night",
    hint: "Easy to talk, a little romantic",
    icon: Wine,
  },
  {
    id: "friends-night",
    label: "Friends night",
    hint: "Good for a group",
    icon: Users,
  },
  {
    id: "solo",
    label: "Solo & cool",
    hint: "Easy to show up alone",
    icon: User,
  },
  {
    id: "easy-to-talk",
    label: "Easy to talk",
    hint: "Quiet enough to chat",
    icon: MessageCircle,
  },
  {
    id: "dance",
    label: "Dance it out",
    hint: "Loud, late, moving",
    icon: Music,
  },
  {
    id: "get-moving",
    label: "Get moving",
    hint: "Active and outside",
    icon: Footprints,
  },
  { id: "free", label: "Free", hint: "No ticket to buy", icon: Gift },
  {
    id: "last-minute",
    label: "Last-minute",
    hint: "Starts within 2 hours",
    icon: Timer,
  },
  {
    id: "golden-hour",
    label: "Golden hour",
    hint: "Sunset, outside",
    icon: Sunset,
  },
  {
    id: "try-new",
    label: "Try something new",
    hint: "Firsts and surprises",
    icon: Sparkles,
  },
];
export const findVibe = (id: string | null | undefined) =>
  VIBES.find((v) => v.id === id) || null;

const LAST_MINUTE_MS = 2 * 60 * 60 * 1000; // "Last-minute": starts within 2 hours from now

/** True when the event has this vibe: tagged on the event, or worked out from price / start time. */
export function hasVibe(event: EventRecord, id: string, now = new Date()) {
  if (id === "free") return eventPriceValue(event) === 0;
  if (id === "last-minute") {
    const start = event.start ? new Date(event.start).getTime() : NaN;
    const left = start - now.getTime();
    return left >= 0 && left <= LAST_MINUTE_MS;
  }
  return (event.moods || []).includes(id);
}

// The picked vibe, for this session only (sessionStorage).
const SESSION_KEY = "eventloop-vibe";
export function readSessionVibe(): string {
  try {
    const id = sessionStorage.getItem(SESSION_KEY);
    return findVibe(id) ? (id as string) : "";
  } catch {
    return "";
  }
}
export function saveSessionVibe(id: string) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

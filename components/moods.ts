/**
 * Moods ("vibes"): how an evening feels, separate from the category (what it is).
 * Events carry `moods` read from their title and description; "Out late" and "Budget-friendly"
 * are worked out from the start time and price. "My vibes" (the modal) stores the picked ids per
 * account; Explore's "Made for your vibe" row uses them.
 */
import {
  Coffee,
  Users,
  Moon,
  Footprints,
  Hammer,
  Lightbulb,
  Wine,
  Wallet,
} from "lucide-react";
import { eventPriceValue, type EventRecord } from "./event-data";
import { currentUserId } from "./auth";

export const MOODS = [
  { id: "chill", label: "Chill", icon: Coffee },
  { id: "meet-people", label: "Meet people", icon: Users },
  { id: "out-late", label: "Out late", icon: Moon },
  { id: "get-moving", label: "Get moving", icon: Footprints },
  { id: "make-things", label: "Make things", icon: Hammer },
  { id: "learn", label: "Learn something", icon: Lightbulb },
  { id: "date-night", label: "Date night", icon: Wine },
  { id: "budget", label: "Budget-friendly", icon: Wallet },
];
export const moodLabel = (id: string) =>
  MOODS.find((m) => m.id === id)?.label || id;

const LATE_HOUR = 21; // "Out late": starts at 21:00 or later
const BUDGET_MAX = 10; // "Budget-friendly": free or up to €10

/** The event's moods: the ones read from its text plus the two worked out from its data. */
export function eventMoods(event: EventRecord): string[] {
  const moods = [...(event.moods || [])];
  const start = event.start ? new Date(event.start) : null;
  if (start && !Number.isNaN(start.getTime()) && start.getHours() >= LATE_HOUR)
    moods.push("out-late");
  const price = eventPriceValue(event);
  if (price !== null && price <= BUDGET_MAX) moods.push("budget");
  return [...new Set(moods)];
}

// One entry per account. The old "prefs" key (categories + neighbourhoods) is simply ignored.
const key = () => `eventloop-moods:${currentUserId()}`;

export function readMyMoods(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(key()) || "[]");
    const known = new Set(MOODS.map((m) => m.id));
    return Array.isArray(list)
      ? list.map(String).filter((id) => known.has(id))
      : [];
  } catch {
    return [];
  }
}

export function saveMyMoods(ids: string[]) {
  try {
    localStorage.setItem(key(), JSON.stringify(ids));
  } catch {}
}

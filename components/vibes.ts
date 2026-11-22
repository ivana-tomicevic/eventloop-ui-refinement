import {
  Music,
  Palette,
  Dumbbell,
  Leaf,
  Hammer,
  BookOpen,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { CATEGORY_LABELS } from "./event-data";

/**
 * Category chips ("What's on?"). Labels come from CATEGORY_LABELS, the same names the cards show.
 * `tone` picks the --cat-* accent a chip uses on hover and when selected.
 * Shared by Explore and the organizer's Create an event form. Moods are separate: ./moods.ts.
 */
export const CATEGORIES = [
  { id: "music", icon: Music, tone: "music" },
  { id: "culture", icon: Palette, tone: "arts" },
  { id: "sports", icon: Dumbbell, tone: "sports" },
  { id: "nature", icon: Leaf, tone: "outdoors" },
  { id: "workshops", icon: Hammer, tone: "workshops" },
  { id: "learning", icon: BookOpen, tone: "learn" },
  { id: "social", icon: Users, tone: "social" },
  { id: "food", icon: UtensilsCrossed, tone: "food" },
].map((c) => ({ ...c, label: CATEGORY_LABELS[c.id] }));

/** Pilot neighbourhoods (CLAUDE.md). Used by Explore, the host profile and the organizer form. */
export const NEIGHBOURHOODS = [
  "Malasaña",
  "Lavapiés",
  "La Latina",
  "Chueca",
  "Retiro",
  "Chamberí",
];

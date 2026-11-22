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

/**
 * Category chips ("What's on?"): short labels for the category ids (cards keep CATEGORY_LABELS).
 * `tone` picks the --cat-* accent a chip uses on hover and when selected.
 * Shared by Explore and the organizer's Create an event form. Moods are separate: ./moods.ts.
 */
export const CATEGORIES = [
  { id: "music", label: "Music", icon: Music, tone: "music" },
  { id: "culture", label: "Arts", icon: Palette, tone: "arts" },
  { id: "sports", label: "Sports", icon: Dumbbell, tone: "sports" },
  { id: "nature", label: "Outdoors", icon: Leaf, tone: "outdoors" },
  { id: "workshops", label: "Workshops", icon: Hammer, tone: "workshops" },
  { id: "learning", label: "Learn", icon: BookOpen, tone: "learn" },
  { id: "social", label: "Social", icon: Users, tone: "social" },
  { id: "food", label: "Food and drink", icon: UtensilsCrossed, tone: "food" },
];

/** Pilot neighbourhoods (CLAUDE.md). Used by Explore, the host profile and the organizer form. */
export const NEIGHBOURHOODS = [
  "Malasaña",
  "Lavapiés",
  "La Latina",
  "Chueca",
  "Retiro",
  "Chamberí",
];

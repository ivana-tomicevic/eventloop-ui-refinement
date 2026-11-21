"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Music2,
  Palette,
  Dumbbell,
  Mountain,
  PenLine,
  BookOpen,
  Users,
  UtensilsCrossed,
  Sparkles,
  Search,
} from "lucide-react";
import SiteNav from "./site-nav";
import EventCard from "./event-card";
import {
  getEvents,
  CATEGORY_LABELS,
  getSavedIds,
  toggleSaved,
  type EventRecord,
} from "./event-data";
const categories = [
  { id: "music", label: CATEGORY_LABELS.music, icon: Music2, tone: "#8a54ad" },
  {
    id: "culture",
    label: CATEGORY_LABELS.culture,
    icon: Palette,
    tone: "#cb794c",
  },
  {
    id: "sports",
    label: CATEGORY_LABELS.sports,
    icon: Dumbbell,
    tone: "#438b73",
  },
  {
    id: "nature",
    label: CATEGORY_LABELS.nature,
    icon: Mountain,
    tone: "#668d56",
  },
  {
    id: "workshops",
    label: CATEGORY_LABELS.workshops,
    icon: PenLine,
    tone: "#b9843d",
  },
  {
    id: "learning",
    label: CATEGORY_LABELS.learning,
    icon: BookOpen,
    tone: "#507bb9",
  },
  { id: "social", label: CATEGORY_LABELS.social, icon: Users, tone: "#ba6c8d" },
  {
    id: "food",
    label: CATEGORY_LABELS.food,
    icon: UtensilsCrossed,
    tone: "#b76c50",
  },
];
type TimeFilter = "tonight" | "tomorrow" | "weekend" | "all";
const timeOptions: {
  id: TimeFilter;
  label: string;
  title: string;
  /** Empty-state heading; the description line is picked in the render. */
  empty: string;
}[] = [
  {
    id: "tonight",
    label: "Tonight",
    title: "Tonight in Madrid",
    empty: "Quiet night.",
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    title: "Tomorrow in Madrid",
    empty: "Nothing on tomorrow. Yet.",
  },
  {
    id: "weekend",
    label: "Weekend",
    title: "This weekend in Madrid",
    empty: "Quiet weekend so far.",
  },
  { id: "all", label: "All", title: "All events in Madrid", empty: "" },
];
const dayStart = (d: Date, offset = 0, hour = 0) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset, hour);
/** Half-open local-time range [from, to), or null for "All". */
function timeRange(filter: TimeFilter, now: Date): [Date, Date] | null {
  if (filter === "tonight") return [dayStart(now, 0, 17), dayStart(now, 1)];
  if (filter === "tomorrow") return [dayStart(now, 1), dayStart(now, 2)];
  if (filter === "weekend") {
    // Nearest Saturday and Sunday; on a Sunday that is the current weekend.
    const day = now.getDay();
    const saturday = dayStart(now, day === 0 ? -1 : 6 - day);
    return [saturday, dayStart(saturday, 2)];
  }
  return null;
}
function matchesTime(e: EventRecord, range: [Date, Date] | null) {
  if (!range) return true;
  const start = e.start ? new Date(e.start) : null;
  if (!start || Number.isNaN(start.getTime())) return false;
  return start >= range[0] && start < range[1];
}
export default function EventloopScreen({
  savedOnly = false,
}: {
  savedOnly?: boolean;
}) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [vibe, setVibe] = useState("");
  const [activeVibe, setActiveVibe] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const activeTime = timeOptions.find((o) => o.id === timeFilter)!;
  const [interests, setInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const loaded = getEvents();
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setEvents(loaded);
    // Explore opens on "Tonight" when something is on tonight, otherwise "All" — never an empty first view.
    // A search handed over from another page (?q=) starts on "All" so its results aren't hidden.
    if (!savedOnly && !q) {
      const tonight = timeRange("tonight", new Date());
      if (loaded.some((e) => e.status !== "Draft" && matchesTime(e, tonight)))
        setTimeFilter("tonight");
    }
    setSearch(q);
    setSaved(getSavedIds());
    try {
      setInterests(
        JSON.parse(
          localStorage.getItem("eventloop-onboarding-interests") || "[]",
        ),
      );
    } catch {}
  }, []);
  useEffect(() => {
    const handle = (e: Event) =>
      setSearch((e as CustomEvent<string>).detail || "");
    window.addEventListener("eventloop-search", handle);
    return () => window.removeEventListener("eventloop-search", handle);
  }, []);
  const toggle = (id: string | number) => setSaved(toggleSaved(id));
  const searchable = (e: EventRecord) =>
    [
      e.title,
      e.category,
      e.subcategory,
      e.summary,
      e.description,
      e.location,
      e.venue,
      e.neighbourhood,
      ...(e.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  const tomorrowCount = useMemo(() => {
    const range = timeRange("tomorrow", new Date());
    return events.filter((e) => e.status !== "Draft" && matchesTime(e, range))
      .length;
  }, [events]);
  const filtered = useMemo(() => {
    const range = timeRange(timeFilter, new Date());
    return events
      .filter(
        (e) =>
          e.status !== "Draft" &&
          matchesTime(e, range) &&
          (!savedOnly || saved.includes(String(e.id))) &&
          (!category || e.category === category) &&
          (!search || searchable(e).includes(search.toLowerCase())) &&
          (!activeVibe ||
            activeVibe
              .toLowerCase()
              .split(/[^\p{L}\p{N}]+/u)
              .some((word) => word.length > 2 && searchable(e).includes(word))),
      )
      .sort((a, b) => {
        const score = (e: EventRecord) =>
          interests.filter((i) => searchable(e).includes(i.toLowerCase()))
            .length;
        return score(b) - score(a);
      });
  }, [
    events,
    search,
    category,
    activeVibe,
    saved,
    savedOnly,
    interests,
    timeFilter,
  ]);
  return (
    <main className="eventloop-shell">
      <SiteNav showSearch={savedOnly} />
      <div className="eventloop-content explore-content">
        <section className="el-explore-header" aria-labelledby="explore-title">
          <h1 id="explore-title" aria-live="polite">
            {activeTime.title}
          </h1>
          <form
            className="el-search-pill"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveVibe(vibe.trim());
            }}
          >
            <label htmlFor="explore-search" className="sr-only">
              Search events
            </label>
            <Search aria-hidden="true" className="el-search-pill__icon" />
            <input
              id="explore-search"
              type="search"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder='Try "chill jazz, free entry"'
            />
            <button type="submit" aria-label="Search">
              <Sparkles aria-hidden="true" />
            </button>
          </form>
          <div className="el-time-filter" role="group" aria-label="When">
            {timeOptions.map((o) => (
              <button
                type="button"
                key={o.id}
                aria-pressed={timeFilter === o.id}
                onClick={() => setTimeFilter(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>
        {!savedOnly && (
          <>
            <section className="category-section">
              <div className="section-heading">
                <h2>{"What's your vibe?"}</h2>
                <p>Pick a mood. We'll find the plan.</p>
              </div>
              <div className="category-grid">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    className={
                      "category-card " +
                      (category === cat.id ? "category-card--active" : "")
                    }
                    onClick={() =>
                      setCategory(category === cat.id ? "" : cat.id)
                    }
                  >
                    <cat.icon size={23} color={cat.tone} strokeWidth={1.9} />
                    <strong>{cat.label}</strong>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
        <section className="explore-results">
          <div className="results-heading">
            <div>
              <h2>
                {savedOnly
                  ? "Saved events"
                  : activeVibe
                    ? "Matches for your vibe"
                    : interests.length && !search && !category
                      ? "Picked for you"
                      : "Pick of the night"}
              </h2>
              <p>
                {savedOnly
                  ? "Your bookmarked experiences"
                  : `${filtered.length} ${filtered.length === 1 ? "thing" : "things"} to do`}
              </p>
            </div>
            {(search || category || activeVibe) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setActiveVibe("");
                  setVibe("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="event-grid">
            {filtered.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                saved={saved.includes(String(e.id))}
                onSave={toggle}
              />
            ))}
          </div>
          {!filtered.length && timeFilter !== "all" && (
            <div className="el-empty">
              <h2>{activeTime.empty}</h2>
              <p>
                {timeFilter === "tonight" && tomorrowCount > 0
                  ? "Tomorrow is packed."
                  : "Try another day."}
              </p>
              <button
                type="button"
                className="el-empty__cta"
                onClick={() => setTimeFilter("all")}
              >
                Show all events
              </button>
            </div>
          )}
          {!filtered.length && timeFilter === "all" && (
            <div className="explore-empty">
              <h3>
                {savedOnly ? "No saved events yet" : "No matching events"}
              </h3>
              <p>
                {savedOnly
                  ? "Tap the heart on an event card to save it."
                  : "Try a different search or category."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

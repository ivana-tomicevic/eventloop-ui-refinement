"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Music,
  Palette,
  Dumbbell,
  Leaf,
  Hammer,
  BookOpen,
  Users,
  UtensilsCrossed,
  Sparkles,
  Search,
} from "lucide-react";
import SiteNav from "./site-nav";
import EventCard from "./event-card";
import FeaturedCard from "./featured-card";
import {
  getEvents,
  getSavedIds,
  toggleSaved,
  type EventRecord,
} from "./event-data";
/**
 * Vibe chips: short labels for the existing category ids (cards keep CATEGORY_LABELS).
 * `tone` picks the --cat-* tokens a chip uses when selected.
 */
const vibes = [
  { id: "music", label: "Music", icon: Music, tone: "music" },
  { id: "culture", label: "Arts", icon: Palette, tone: "arts" },
  { id: "sports", label: "Sports", icon: Dumbbell, tone: "sports" },
  { id: "nature", label: "Outdoors", icon: Leaf, tone: "outdoors" },
  { id: "workshops", label: "Workshops", icon: Hammer, tone: "workshops" },
  { id: "learning", label: "Learn", icon: BookOpen, tone: "learn" },
  { id: "social", label: "Social", icon: Users, tone: "social" },
  { id: "food", label: "Food and drink", icon: UtensilsCrossed, tone: "food" },
];
type EmptyStateProps = {
  title: string;
  text: string;
  action?: { label: string; onClick?: () => void; href?: string };
};
/** Empty state (.empty in the reference) shown instead of the results. */
function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="el-empty" role="status">
      <h2>{title}</h2>
      <p>{text}</p>
      {action &&
        (action.href ? (
          <a className="el-empty__cta" href={action.href}>
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            className="el-empty__cta"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
type TimeFilter = "tonight" | "tomorrow" | "weekend" | "all";
const timeOptions: {
  id: TimeFilter;
  label: string;
  title: string;
  /** Empty-state heading; the description line is picked in the render. */
  empty: string;
  /** Featured section title, grid title under it, grid title when nothing is featured. */
  pick: string;
  more: string;
  on: string;
}[] = [
  {
    id: "tonight",
    label: "Tonight",
    title: "Tonight in Madrid",
    empty: "Quiet night.",
    pick: "Pick of the night",
    more: "More tonight",
    on: "Tonight",
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    title: "Tomorrow in Madrid",
    empty: "Nothing on tomorrow. Yet.",
    pick: "Pick for tomorrow",
    more: "More tomorrow",
    on: "Tomorrow",
  },
  {
    id: "weekend",
    label: "Weekend",
    title: "This weekend in Madrid",
    empty: "Quiet weekend so far.",
    pick: "Pick of the weekend",
    more: "More this weekend",
    on: "This weekend",
  },
  {
    id: "all",
    label: "All",
    title: "All events in Madrid",
    empty: "",
    pick: "Don't miss this",
    more: "More events",
    on: "All events",
  },
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
  /** False until localStorage is read, so the server render shows no results and no empty state. */
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [vibe, setVibe] = useState("");
  const [activeVibe, setActiveVibe] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  /** The filter Explore opened on; "Clear filters" in the empty state returns to it. */
  const [defaultTime, setDefaultTime] = useState<TimeFilter>("all");
  const activeTime = timeOptions.find((o) => o.id === timeFilter)!;
  const [interests, setInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const list = getEvents();
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setEvents(list);
    setLoaded(true);
    // Explore opens on "Tonight" when something is on tonight, otherwise "All" — never an empty first view.
    // A search handed over from another page (?q=) starts on "All" so its results aren't hidden.
    if (!savedOnly && !q) {
      const tonight = timeRange("tonight", new Date());
      if (list.some((e) => e.status !== "Draft" && matchesTime(e, tonight))) {
        setTimeFilter("tonight");
        setDefaultTime("tonight");
      }
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
  /** How many events each day filter has (ignoring vibe and search) — the empty state points to a busy day. */
  const dayCounts = useMemo(() => {
    const now = new Date();
    const count = (f: TimeFilter) =>
      events.filter(
        (e) => e.status !== "Draft" && matchesTime(e, timeRange(f, now)),
      ).length;
    return { tomorrow: count("tomorrow"), weekend: count("weekend") };
  }, [events]);
  const clearSearch = () => {
    setSearch("");
    setActiveVibe("");
    setVibe("");
  };
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
  // Featured pick: only without a text search and with at least 3 results.
  // First result flagged `featured`, otherwise the first result.
  const featured =
    !savedOnly && !search && !activeVibe && filtered.length >= 3
      ? filtered.find((e) => e.featured) || filtered[0]
      : null;
  const gridEvents = featured
    ? filtered.filter((e) => e !== featured)
    : filtered;
  // One empty state that replaces both sections. The most specific cause wins: search, vibe, then day.
  const showAll = {
    label: "Show all events",
    onClick: () => setTimeFilter("all"),
  };
  const empty: EmptyStateProps = savedOnly
    ? {
        title: "No saved events yet.",
        text: "Tap the heart on any event to keep it here.",
        action: { label: "Explore events", href: "/" },
      }
    : search || activeVibe
      ? {
          title: "Nothing matches that.",
          text: "Try fewer words or another vibe.",
          action: { label: "Clear search", onClick: clearSearch },
        }
      : category
        ? {
            title: "No matches.",
            text: "Try another vibe or time.",
            action: {
              label: "Clear filters",
              onClick: () => {
                setCategory("");
                setTimeFilter(defaultTime);
              },
            },
          }
        : timeFilter === "tonight"
          ? dayCounts.tomorrow
            ? {
                title: "Quiet night.",
                text: "Tomorrow is packed.",
                action: {
                  label: "See tomorrow",
                  onClick: () => setTimeFilter("tomorrow"),
                },
              }
            : {
                title: "Quiet night.",
                text: "There's more later this week.",
                action: showAll,
              }
          : timeFilter === "tomorrow"
            ? dayCounts.weekend
              ? {
                  title: "Nothing on tomorrow. Yet.",
                  text: "The weekend is looking good.",
                  action: {
                    label: "See the weekend",
                    onClick: () => setTimeFilter("weekend"),
                  },
                }
              : {
                  title: "Nothing on tomorrow. Yet.",
                  text: "There's more later this week.",
                  action: showAll,
                }
            : timeFilter === "weekend"
              ? {
                  title: "Quiet weekend so far.",
                  text: "The week has plenty going on.",
                  action: showAll,
                }
              : {
                  title: "Nothing on right now.",
                  text: "New events drop every week. Check back soon.",
                };
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
          <section className="el-vibes" aria-labelledby="vibes-title">
            <h2 id="vibes-title" className="el-section-label">
              {"What's your vibe?"}
            </h2>
            <div
              className="el-vibes__row"
              role="group"
              aria-labelledby="vibes-title"
            >
              {vibes.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  className={`el-vibe el-vibe--${v.tone}`}
                  aria-pressed={category === v.id}
                  onClick={() => setCategory(category === v.id ? "" : v.id)}
                >
                  <v.icon aria-hidden="true" />
                  {v.label}
                </button>
              ))}
            </div>
          </section>
        )}
        {loaded && featured && (
          <section className="el-results-section" aria-labelledby="pick-title">
            <div className="el-sec">
              <h2 id="pick-title">{activeTime.pick}</h2>
              {timeFilter === "tonight" && (
                <span className="el-sec__aside">Fresh for tonight</span>
              )}
            </div>
            <FeaturedCard
              event={featured}
              saved={saved.includes(String(featured.id))}
              onSave={toggle}
            />
          </section>
        )}
        {loaded && !filtered.length && <EmptyState {...empty} />}
        {loaded && gridEvents.length > 0 && (
          <section className="el-results-section" aria-labelledby="grid-title">
            <div className="el-sec">
              <h2 id="grid-title">
                {savedOnly
                  ? "Saved events"
                  : featured
                    ? activeTime.more
                    : search || activeVibe
                      ? "Matches for your vibe"
                      : activeTime.on}
              </h2>
              <span className="el-sec__aside">
                {gridEvents.length}{" "}
                {gridEvents.length === 1 ? "event" : "events"}
                {(search || category || activeVibe) && (
                  <button
                    type="button"
                    className="el-sec__clear"
                    onClick={() => {
                      clearSearch();
                      setCategory("");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </span>
            </div>
            <div className="el-grid">
              {gridEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  saved={saved.includes(String(e.id))}
                  onSave={toggle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

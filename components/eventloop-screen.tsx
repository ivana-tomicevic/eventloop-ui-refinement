"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import SiteNav from "./site-nav";
import { CATEGORIES } from "./vibes";
import {
  findVibe,
  hasVibe,
  markVibeIntroSeen,
  readSessionVibe,
  saveSessionVibe,
  vibeIntroSeen,
} from "./moods";
import { authUrl, isSignedIn, saveOrAskToSignIn, startHosting } from "./auth";
import { readHostProfile } from "./host";
import VibePicker from "./vibe-picker";
import AreaPicker from "./area-picker";
import EventCard from "./event-card";
import FeaturedCard from "./featured-card";
import { getEvents, getSavedIds, type EventRecord } from "./event-data";
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
  /** Grid title under "Starting soon", grid title when nothing is featured. */
  more: string;
  on: string;
  /** End of the vibe empty state: "Nothing for Date night tonight." */
  when: string;
}[] = [
  {
    id: "tonight",
    label: "Tonight",
    title: "Tonight in Madrid",
    empty: "Quiet night.",
    more: "More tonight",
    on: "Tonight",
    when: "tonight",
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    title: "Tomorrow in Madrid",
    empty: "Nothing on tomorrow. Yet.",
    more: "More tomorrow",
    on: "Tomorrow",
    when: "tomorrow",
  },
  {
    id: "weekend",
    label: "Weekend",
    title: "This weekend in Madrid",
    empty: "Quiet weekend so far.",
    more: "More this weekend",
    on: "This weekend",
    when: "this weekend",
  },
  {
    id: "all",
    label: "All",
    title: "All events in Madrid",
    empty: "",
    more: "More events",
    on: "All events",
    when: "right now",
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
  const [vibe, setVibe] = useState("");
  const [activeVibe, setActiveVibe] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  /** The filter Explore opened on; "Clear filters" in the empty state returns to it. */
  const [defaultTime, setDefaultTime] = useState<TimeFilter>("all");
  const activeTime = timeOptions.find((o) => o.id === timeFilter)!;
  /** One category chip and one neighbourhood at a time ("" = none / anywhere). They filter. */
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  /** The vibe in the title (one at a time, "" = any vibe). Kept for this session only. */
  const [vibeId, setVibeId] = useState("");
  /** First visit: the vibe panel opens by itself, once per person. */
  const [vibeIntro, setVibeIntro] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  /** Footer "Host an event": sign up as a host, the host profile, or the workspace. */
  const [hostLink, setHostLink] = useState(
    authUrl("/", { mode: "signup", host: true }),
  );
  useEffect(() => {
    const list = getEvents();
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const when = params.get("when");
    setEvents(list);
    setLoaded(true);
    // Explore opens on "Tonight" when something is on tonight, otherwise "All" — never an empty first view.
    // A search handed over from another page (?q=) starts on "All" so its results aren't hidden.
    if (!savedOnly && !q) {
      const tonight = timeRange("tonight", new Date());
      if (
        when === "tonight" ||
        list.some((e) => e.status !== "Draft" && matchesTime(e, tonight))
      ) {
        setTimeFilter("tonight");
        setDefaultTime("tonight");
      }
      setVibeId(readSessionVibe());
      setVibeIntro(!vibeIntroSeen());
      if (isSignedIn())
        setHostLink(readHostProfile() ? "/organizer" : "/organizer/setup");
    }
    setSearch(q);
    setSaved(getSavedIds());
  }, []);
  const pickVibe = (id: string) => {
    setVibeId(id);
    saveSessionVibe(id);
  };
  const picked = savedOnly ? null : findVibe(vibeId);
  useEffect(() => {
    const handle = (e: Event) =>
      setSearch((e as CustomEvent<string>).detail || "");
    window.addEventListener("eventloop-search", handle);
    return () => window.removeEventListener("eventloop-search", handle);
  }, []);
  // Saving needs an account: signed-out visitors go to /auth and the save finishes afterwards.
  const toggle = (id: string | number) => {
    const next = saveOrAskToSignIn(id);
    if (next) setSaved(next);
  };
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
  const chipFilter = Boolean(category || area);
  const clearChips = () => {
    setCategory("");
    setArea("");
  };
  // Single choice: another chip replaces it, the selected one switches it off.
  const toggleCategoryChip = (id: string) =>
    setCategory((c) => (c === id ? "" : id));
  const chipsRef = useRef<HTMLDivElement>(null);
  const [chipsFade, setChipsFade] = useState(false);
  useEffect(() => {
    const row = chipsRef.current;
    if (!row) return;
    const update = () =>
      setChipsFade(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", update);
    };
  }, [savedOnly]);
  const filtered = useMemo(() => {
    const now = new Date();
    const range = timeRange(timeFilter, now);
    const startOf = (e: EventRecord) =>
      e.start ? new Date(e.start).getTime() : Number.POSITIVE_INFINITY;
    // Soonest first, so "Starting soon" is always the first event of the tab.
    return events
      .filter(
        (e) =>
          e.status !== "Draft" &&
          matchesTime(e, range) &&
          (!savedOnly || saved.includes(String(e.id))) &&
          (!category || e.category === category) &&
          (!area || e.neighbourhood === area) &&
          (!picked || hasVibe(e, picked.id, now)) &&
          (!search || searchable(e).includes(search.toLowerCase())) &&
          (!activeVibe ||
            activeVibe
              .toLowerCase()
              .split(/[^\p{L}\p{N}]+/u)
              .some((word) => word.length > 2 && searchable(e).includes(word))),
      )
      .sort((a, b) => startOf(a) - startOf(b));
    // searchable only reads the event
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    events,
    search,
    activeVibe,
    saved,
    savedOnly,
    timeFilter,
    category,
    area,
    picked,
  ]);
  // Same rule on every tab: the soonest event is "Starting soon", the rest go below (no duplicates).
  const featured = !savedOnly && filtered.length ? filtered[0] : null;
  const others = featured ? filtered.slice(1) : filtered;
  const gridEvents = others;
  // One empty state that replaces both sections. The most specific cause wins: search, vibe,
  // chips, then day.
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
      : picked
        ? {
            title: `Nothing for “${picked.label}” ${activeTime.when}.`,
            text: "Try another vibe.",
            action: { label: "Any vibe", onClick: () => pickVibe("") },
          }
        : chipFilter
          ? {
              title: "No matches.",
              text: "Try another vibe or time.",
              action: {
                label: "Clear filters",
                onClick: () => {
                  clearChips();
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
  const count = (n: number) => `${n} ${n === 1 ? "event" : "events"}`;
  const grid = (list: EventRecord[]) => (
    <div className="el-grid">
      {list.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          saved={saved.includes(String(e.id))}
          onSave={toggle}
        />
      ))}
    </div>
  );
  return (
    <main className="eventloop-shell">
      <SiteNav showSearch={false} />
      <div className="eventloop-content explore-content">
        <section className="el-explore-header" aria-labelledby="explore-title">
          <h1 id="explore-title" aria-live="polite">
            {savedOnly ? (
              activeTime.title
            ) : (
              <>
                {activeTime.title} for{" "}
                <VibePicker
                  value={vibeId}
                  onChange={pickVibe}
                  autoOpen={vibeIntro}
                  onAutoOpen={markVibeIntroSeen}
                />
              </>
            )}
          </h1>
          {/* Row 1: when + search (phones: search on top, then the tabs) */}
          <div className="el-explore-row">
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
                autoComplete="off"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder='Try "chill jazz, free entry"'
              />
              <button type="submit" aria-label="Search">
                <Sparkles aria-hidden="true" />
              </button>
            </form>
          </div>
          {/* Row 2: neighbourhood | categories */}
          {!savedOnly && (
            <div className="el-filter-row">
              <AreaPicker value={area} onChange={setArea} />
              <span className="el-filter-row__divider" aria-hidden="true" />
              <div
                ref={chipsRef}
                className="el-filter-row__chips"
                data-fade={chipsFade}
                role="group"
                aria-label="Category"
              >
                {CATEGORIES.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    className={`el-vibe el-vibe--${v.tone}`}
                    aria-pressed={category === v.id}
                    onClick={() => toggleCategoryChip(v.id)}
                  >
                    <v.icon aria-hidden="true" />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
        {loaded && featured && (
          <section className="el-results-section" aria-labelledby="pick-title">
            <div className="el-sec">
              <h2 id="pick-title">
                {picked ? `Best for “${picked.label}”` : "Starting soon"}
              </h2>
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
                  : picked
                    ? `More for “${picked.label}”`
                    : featured
                      ? activeTime.more
                      : search || activeVibe
                        ? "Matches for your search"
                        : activeTime.on}
              </h2>
              <span className="el-sec__aside">
                {count(gridEvents.length)}
                {(search || activeVibe) && (
                  <button
                    type="button"
                    className="el-sec__clear"
                    onClick={clearSearch}
                  >
                    Clear search
                  </button>
                )}
              </span>
            </div>
            {grid(gridEvents)}
          </section>
        )}
      </div>
      {!savedOnly && (
        <footer className="el-explore-footer">
          <p>
            Running something?{" "}
            <a
              className="el-details__map"
              href={hostLink}
              onClick={(e) => {
                // With a host profile the link opens the workspace, which needs the hosting role.
                if (hostLink === "/organizer") {
                  e.preventDefault();
                  startHosting();
                  window.location.assign(hostLink);
                }
              }}
            >
              Host an event
            </a>
          </p>
        </footer>
      )}
    </main>
  );
}

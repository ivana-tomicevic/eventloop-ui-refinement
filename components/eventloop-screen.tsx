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
  CalendarDays,
  MapPin,
  Heart,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import SiteNav from "./site-nav";
import {
  getEvents,
  eventDate,
  eventLocation,
  eventPrice,
  eventImage,
  getSavedIds,
  toggleSaved,
  type EventRecord,
} from "./event-data";
const categories = [
  { id: "music", label: "Music", icon: Music2, tone: "#8a54ad" },
  { id: "culture", label: "Arts & Culture", icon: Palette, tone: "#cb794c" },
  { id: "sports", label: "Sports & Fitness", icon: Dumbbell, tone: "#438b73" },
  { id: "nature", label: "Outdoors & Nature", icon: Mountain, tone: "#668d56" },
  { id: "workshops", label: "Workshops", icon: PenLine, tone: "#b9843d" },
  { id: "learning", label: "Learning", icon: BookOpen, tone: "#507bb9" },
  { id: "social", label: "Social", icon: Users, tone: "#ba6c8d" },
  { id: "food", label: "Food & Drink", icon: UtensilsCrossed, tone: "#b76c50" },
];
function Card({
  event,
  saved,
  onSave,
}: {
  event: EventRecord;
  saved: boolean;
  onSave: (id: string | number) => void;
}) {
  return (
    <article className="event-card el-event-card">
      <div className="event-card__image">
        <a href={`/events/${event.id}`} aria-label={`View ${event.title}`}>
          <img
            src={eventImage(event)}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/eventloop-jazz.jpg";
            }}
          />
        </a>
        <button
          className={"el-save " + (saved ? "el-save--active" : "")}
          type="button"
          aria-label={saved ? "Remove saved event" : "Save event"}
          aria-pressed={saved}
          onClick={() => onSave(event.id)}
        >
          <Heart size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="event-card__body">
        <span className="el-card-category">
          {categories.find((c) => c.id === event.category)?.label ||
            event.category ||
            "Event"}
        </span>
        <h3>
          <a href={`/events/${event.id}`}>{event.title}</a>
        </h3>
        {event.summary && <p className="el-card-summary">{event.summary}</p>}
        <div className="el-card-meta">
          <span>
            <CalendarDays size={15} />
            {eventDate(event)}
          </span>
          <span>
            <MapPin size={15} />
            {eventLocation(event)}
          </span>
        </div>
        <strong className="el-card-price">{eventPrice(event)}</strong>
      </div>
    </article>
  );
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
  const [interests, setInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    setEvents(getEvents());
    setSearch(new URLSearchParams(window.location.search).get("q") || "");
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
      ...(e.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  const filtered = useMemo(
    () =>
      events
        .filter(
          (e) =>
            e.status !== "Draft" &&
            (!savedOnly || saved.includes(String(e.id))) &&
            (!category || e.category === category) &&
            (!search || searchable(e).includes(search.toLowerCase())) &&
            (!activeVibe ||
              activeVibe
                .toLowerCase()
                .split(/\s+/)
                .some(
                  (word) => word.length > 2 && searchable(e).includes(word),
                )),
        )
        .sort((a, b) => {
          const score = (e: EventRecord) =>
            interests.filter((i) => searchable(e).includes(i.toLowerCase()))
              .length;
          return score(b) - score(a);
        }),
    [events, search, category, activeVibe, saved, savedOnly, interests],
  );
  return (
    <main className="eventloop-shell">
      <SiteNav />
      <div className="eventloop-content explore-content">
        <section className="el-hero">
          <div className="el-hero-copy">
            <p className="el-kicker">THE CITY IS YOURS TO EXPLORE</p>
            <h1 className="hero-statement">
              <span className="hero-line-first">Find something</span>
              <span className="hero-line-worth">WORTH</span>
              <span className="hero-line-last">going to.</span>
            </h1>
            <p>Good plans start here. Discover what’s happening around you.</p>
          </div>
          <div className="el-ai-search">
            <div className="el-ai-heading">
              <div className="el-ai-heading-text">
                <h2>Describe your vibe</h2>
                <p>Tell us what you’re in the mood for.</p>
              </div>

              <span className="el-ai-label">
                <Sparkles size={12} />
                AI
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveVibe(vibe.trim());
              }}
            >
              <input
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="A cozy jazz night, a creative workshop..."
              />
              <button type="submit" aria-label="Find matching events">
                <ArrowUpRight size={22} strokeWidth={3} />
              </button>
            </form>
            <p className="el-search-disclaimer">Search by mood or keywords.</p>
          </div>
        </section>
        {!savedOnly && (
          <>
            <section className="category-section">
              <div className="section-heading">
                <h2>Browse by category</h2>
                <p>Start with what sounds good today.</p>
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
                      : "Worth checking out"}
              </h2>
              <p>
                {savedOnly
                  ? "Your bookmarked experiences"
                  : `${filtered.length} events to explore`}
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
              <Card
                key={e.id}
                event={e}
                saved={saved.includes(String(e.id))}
                onSave={toggle}
              />
            ))}
          </div>
          {!filtered.length && (
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

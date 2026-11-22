"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import {
  eventCategory,
  eventImage,
  eventImageAlt,
  eventPrice,
  liveChipLabel,
  type EventRecord,
} from "./event-data";

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const startOf = (e: EventRecord) => (e.start ? new Date(e.start) : null);

/**
 * Explore's "Timeline" view (Tonight only): one row per event, by start time, with the hour on
 * the left, a thin line with a dot per event, and a "Now" line at the current time.
 * Hours with nothing on don't get a row; the gap above the next event just grows a little.
 * Styles: app/explore-results.css (.el-tl*).
 */
export default function EventTimeline({
  events,
  saved,
  onSave,
}: {
  /** Already filtered and sorted by start time (soonest first). */
  events: EventRecord[];
  saved: string[];
  onSave: (id: string | number) => void;
}) {
  const now = new Date();
  // "Now" goes before the first event that hasn't started yet (top / bottom when none / all have).
  const nowAt = (() => {
    const i = events.findIndex((e) => {
      const s = startOf(e);
      return s !== null && s.getTime() > now.getTime();
    });
    return i < 0 ? events.length : i;
  })();
  const nowRow = (
    <li
      key="now"
      className="el-tl__now"
      role="separator"
      aria-label="Current time"
    >
      <span className="el-tl__now-label">Now · {clock(now)}</span>
    </li>
  );

  const rows: React.ReactNode[] = [];
  let lastHour: number | null = null;
  events.forEach((e, i) => {
    if (i === nowAt) rows.push(nowRow);
    const start = startOf(e);
    const hour = start ? start.getHours() : null;
    // Empty hours between two events: a little extra space, never empty rows.
    const emptyHours =
      lastHour !== null && hour !== null ? Math.max(0, hour - lastHour - 1) : 0;
    lastHour = hour ?? lastHour;
    const price = eventPrice(e);
    const live = liveChipLabel(e, now);
    const isSaved = saved.includes(String(e.id));
    rows.push(
      <li
        key={e.id}
        className="el-tl__item"
        style={
          emptyHours
            ? ({ "--tl-empty-hours": emptyHours } as React.CSSProperties)
            : undefined
        }
      >
        {start ? (
          <time className="el-tl__time" dateTime={e.start}>
            {clock(start)}
          </time>
        ) : (
          <span className="el-tl__time" />
        )}
        <span className="el-tl__dot" aria-hidden="true" />
        <article className="el-tl-card">
          <a className="el-tl-card__link" href={`/events/${e.id}`}>
            <span className="el-tl-card__photo">
              <Image
                src={eventImage(e)}
                alt={eventImageAlt(e)}
                fill
                sizes="72px"
                className="object-cover"
                onError={(ev) => {
                  ev.currentTarget.style.visibility = "hidden";
                }}
              />
            </span>
            <span className="el-tl-card__text">
              <span className="el-tl-card__title">{e.title}</span>
              <span className="el-tl-card__meta">
                {[e.neighbourhood, eventCategory(e)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {live && (
                <span className="el-card__chip el-card__chip--live el-tl-card__chip">
                  {live}
                </span>
              )}
            </span>
            {price === "Free" ? (
              <span className="el-card__free">Free</span>
            ) : (
              <span className="el-card__price el-tl-card__price">{price}</span>
            )}
          </a>
          <button
            className={
              "el-card__save el-tl-card__save" +
              (isSaved ? " el-card__save--active" : "")
            }
            type="button"
            aria-label={
              isSaved ? `Remove ${e.title} from saved` : `Save ${e.title}`
            }
            aria-pressed={isSaved}
            onClick={() => onSave(e.id)}
          >
            <Heart
              size={17}
              strokeWidth={2}
              fill={isSaved ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </article>
      </li>,
    );
  });
  if (nowAt === events.length) rows.push(nowRow);

  return <ol className="el-tl">{rows}</ol>;
}

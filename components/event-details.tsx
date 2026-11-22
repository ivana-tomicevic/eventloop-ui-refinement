"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Heart,
  Languages,
  Ticket,
} from "lucide-react";
import SiteNav from "./site-nav";
import {
  bookingLabel,
  eventCategory,
  eventDate,
  eventImage,
  eventLocation,
  eventPrice,
  findEvent,
  formatDuration,
  getSavedIds,
  isFree,
  type EventRecord,
} from "./event-data";
import { authUrl, isSignedIn, saveOrAskToSignIn } from "./auth";
import { hostName } from "./host";

/**
 * Event details. Same type, price and button styles as the Explore cards (docs/explore-reference.html).
 * Styles: app/details.css (tokens only).
 */
export default function EventDetails({ id }: { id: string }) {
  // undefined = still reading localStorage, null = no event with this id
  const [event, setEvent] = useState<EventRecord | null | undefined>();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const found = findEvent(id) ?? null;
    setEvent(found);
    if (found) setSaved(getSavedIds().includes(String(found.id)));
  }, [id]);

  if (event === undefined)
    return (
      <main className="event-details-page">
        <SiteNav showSearch={false} />
        <div className="el-details" aria-busy="true">
          <div className="el-details__hero el-details__hero--loading" />
          <p className="el-details__loading">Loading…</p>
        </div>
      </main>
    );

  if (event === null)
    return (
      <main className="event-details-page">
        <SiteNav showSearch={false} />
        <div className="el-details">
          <div className="el-empty">
            <h2>Event not found</h2>
            <p>It may have ended or moved. Plenty more is on.</p>
            <a className="el-empty__cta" href="/">
              Back to Explore
            </a>
          </div>
        </div>
      </main>
    );

  const price = eventPrice(event);
  const checkoutHref = `/checkout?event=${encodeURIComponent(String(event.id))}`;
  const free = isFree(event);
  const description = event.description || event.summary;
  // Tags that repeat the category ("Social", "Sport" for Sports) or the price ("Free") are already shown above.
  const singular = (word: string) => word.toLowerCase().replace(/s$/, "");
  const shownAbove = new Set(
    [...eventCategory(event).split(/[^\p{L}]+/u), event.category || "", "free"]
      .filter(Boolean)
      .map(singular),
  );
  const tags = (event.tags || []).filter(
    (tag) => !shownAbove.has(singular(tag)),
  );
  const place =
    event.address ||
    [event.venue, event.neighbourhood].filter(Boolean).join(", ") ||
    event.location;
  const mapUrl = place
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place + ", Madrid")}`
    : "";
  const goodToKnow = [
    event.entry && { icon: Ticket, label: "Entry", value: event.entry },
    event.durationMinutes && {
      icon: Clock3,
      label: "Duration",
      value: formatDuration(event.durationMinutes),
    },
    event.language && {
      icon: Languages,
      label: "Language",
      value: event.language,
    },
  ].filter(Boolean) as { icon: typeof Ticket; label: string; value: string }[];

  return (
    <main className="event-details-page">
      <SiteNav showSearch={false} />
      <article className="el-details">
        <div className="el-details__hero">
          <Image
            src={eventImage(event)}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 760px"
            className="object-cover"
            // A missing photo leaves the placeholder behind it visible.
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
            preload
          />
          <a className="el-details__back" href="/" aria-label="Back to Explore">
            <ArrowLeft aria-hidden="true" />
          </a>
          <button
            className={
              "el-card__save" + (saved ? " el-card__save--active" : "")
            }
            type="button"
            aria-label={
              saved ? `Remove ${event.title} from saved` : `Save ${event.title}`
            }
            aria-pressed={saved}
            onClick={() => {
              const next = saveOrAskToSignIn(event.id);
              if (next) setSaved(next.includes(String(event.id)));
            }}
          >
            <Heart
              size={17}
              strokeWidth={2}
              fill={saved ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>

        <header className="el-details__head">
          <p className="el-details__category">{eventCategory(event)}</p>
          <h1 className="el-details__title">{event.title}</h1>
          <p className="el-details__place">
            {eventLocation(event)}
            {!event.online && mapUrl && (
              <a
                className="el-details__map"
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open map <ExternalLink aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </p>
          {hostName(event) && (
            <p className="el-details__host">Hosted by {hostName(event)}</p>
          )}
        </header>

        <div className="el-details__facts">
          <p className="el-details__date">
            <CalendarDays aria-hidden="true" />
            {eventDate(event)}
          </p>
          {/* Price + main action. On phones this bar sticks to the bottom of the screen. */}
          <div className="el-details__action">
            {free ? (
              <span className="el-card__free">Free</span>
            ) : (
              <span className="el-card__price el-feat__price">{price}</span>
            )}
            <a
              className="el-details__cta"
              href={checkoutHref}
              onClick={(e) => {
                // Tickets need an account; after signing in they land on checkout.
                if (!isSignedIn()) {
                  e.preventDefault();
                  window.location.assign(authUrl(checkoutHref));
                }
              }}
            >
              {bookingLabel(event)}
            </a>
          </div>
        </div>

        {description && (
          <section
            className="el-details__section"
            aria-labelledby="about-title"
          >
            <h2 id="about-title">About</h2>
            <p className="el-details__text">{description}</p>
            {tags.length ? (
              <ul className="el-details__tags" aria-label="Tags">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </section>
        )}

        {goodToKnow.length > 0 && (
          <section className="el-details__section" aria-labelledby="good-title">
            <h2 id="good-title">Good to know</h2>
            <dl className="el-details__facts-list">
              {goodToKnow.map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <dt>
                    <Icon aria-hidden="true" />
                    {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>
    </main>
  );
}

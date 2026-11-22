"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import {
  eventCategory,
  eventDate,
  eventImage,
  eventLocation,
  eventPrice,
  isTonight,
  type EventRecord,
} from "./event-data";

/**
 * Event card — matches docs/explore-reference.html (.card).
 * The whole card is one link; the save heart is a separate button laid over the image
 * (a button can't live inside a link).
 * Organizer screens reuse it: without `onSave` there is no heart, and `href={null}` makes a
 * non-clickable card (the live preview in Create an event). `actions` adds a bottom row inside
 * the card, outside the link (the organizer's status + Edit / Publish / Delete).
 */
export default function EventCard({
  event,
  saved = false,
  onSave,
  href,
  actions,
  note,
}: {
  event: EventRecord;
  saved?: boolean;
  onSave?: (id: string | number) => void;
  href?: string | null;
  actions?: ReactNode;
  /** Small line under the price (the organizer's sales) */
  note?: ReactNode;
}) {
  const price = eventPrice(event);
  const Wrapper = href === null ? "div" : "a";
  const link = href === null ? {} : { href: href ?? `/events/${event.id}` };
  return (
    <article className="el-card">
      <Wrapper className="el-card__link" {...link}>
        <div className="el-card__media">
          <Image
            src={eventImage(event)}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 900px) 50vw, 340px"
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <span
            className={
              "el-card__chip" + (isTonight(event) ? " el-card__chip--hot" : "")
            }
          >
            {eventDate(event)}
          </span>
        </div>
        <div className="el-card__body">
          <p className="el-card__category">{eventCategory(event)}</p>
          <h3 className="el-card__title">{event.title}</h3>
          <p className="el-card__meta">{eventLocation(event)}</p>
          <div className="el-card__footer">
            {price === "Free" ? (
              <span className="el-card__free">Free</span>
            ) : (
              <span className="el-card__price">{price}</span>
            )}
          </div>
          {note && <p className="el-card__note">{note}</p>}
        </div>
      </Wrapper>
      {actions && <div className="el-card__actions">{actions}</div>}
      {onSave && (
        <button
          className={"el-card__save" + (saved ? " el-card__save--active" : "")}
          type="button"
          aria-label={
            saved ? `Remove ${event.title} from saved` : `Save ${event.title}`
          }
          aria-pressed={saved}
          onClick={() => onSave(event.id)}
        >
          <Heart
            size={17}
            strokeWidth={2}
            fill={saved ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      )}
    </article>
  );
}

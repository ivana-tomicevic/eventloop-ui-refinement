"use client";
import Image from "next/image";
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
 */
export default function EventCard({
  event,
  saved,
  onSave,
}: {
  event: EventRecord;
  saved: boolean;
  onSave: (id: string | number) => void;
}) {
  const price = eventPrice(event);
  return (
    <article className="el-card">
      <a className="el-card__link" href={`/events/${event.id}`}>
        <div className="el-card__media">
          <Image
            src={eventImage(event)}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 900px) 50vw, 340px"
            className="object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/photos/events/jazz.jpg";
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
        </div>
      </a>
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
    </article>
  );
}

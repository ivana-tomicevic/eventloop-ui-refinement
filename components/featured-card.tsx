"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import {
  bookingLabel,
  eventCategory,
  eventDate,
  eventImage,
  eventLocation,
  eventPrice,
  isTonight,
  type EventRecord,
} from "./event-data";

/**
 * Featured "Pick of the night" card — docs/explore-reference.html (.card.feat).
 * Reuses the event card's chip, heart, price and Free pill classes. The whole card is one link;
 * The booking label is only styled like a button (a link can't contain another interactive element),
 * and the heart is a separate button laid over the image.
 */
export default function FeaturedCard({
  event,
  saved,
  onSave,
}: {
  event: EventRecord;
  saved: boolean;
  onSave: (id: string | number) => void;
}) {
  const price = eventPrice(event);
  const description = event.summary || event.description;
  return (
    <article className="el-card el-feat">
      <a className="el-card__link el-feat__link" href={`/events/${event.id}`}>
        <div className="el-card__media el-feat__media">
          <Image
            src={eventImage(event)}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, 600px"
            className="object-cover"
            preload
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
          <h3 className="el-card__title el-feat__title">{event.title}</h3>
          <p className="el-card__meta el-feat__meta">{eventLocation(event)}</p>
          {description && <p className="el-feat__desc">{description}</p>}
          <div className="el-card__footer">
            {price === "Free" ? (
              <span className="el-card__free">Free</span>
            ) : (
              <span className="el-card__price el-feat__price">{price}</span>
            )}
            <span className="el-feat__cta">{bookingLabel(event)}</span>
          </div>
        </div>
      </a>
      <button
        className={
          "el-card__save el-feat__save" +
          (saved ? " el-card__save--active" : "")
        }
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

"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import SiteNav from "./site-nav";
import {
  eventDate,
  eventImage,
  eventLocation,
  type EventRecord,
} from "./event-data";

const MAX_SPOTS = 4;
const ORDER_KEY = "eventloop-demo-order";

function EventSummary({ event }: { event: EventRecord }) {
  return (
    <div className="el-join__event">
      <div className="el-join__thumb">
        <Image
          src={eventImage(event)}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div>
        <h2>{event.title}</h2>
        <p>{eventDate(event)}</p>
        <p>{eventLocation(event)}</p>
      </div>
    </div>
  );
}

/**
 * Checkout for a free event: pick spots, leave a name and email, confirm. No payment step.
 * Saves the same demo order as the paid flow (total 0, free: true), then goes to the confirmation.
 */
export function FreeJoin({ event }: { event: EventRecord }) {
  const [spots, setSpots] = useState(1);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sessionStorage.setItem(
      ORDER_KEY,
      JSON.stringify({
        eventId: String(event.id),
        quantities: { general: spots, vip: 0, student: 0 },
        total: 0,
        confirmed: true,
        free: true,
      }),
    );
    window.location.assign(
      `/booking/success?event=${encodeURIComponent(String(event.id))}`,
    );
  };
  return (
    <main className="event-details-page">
      <SiteNav showSearch={false} />
      <div className="el-details">
        <h1 className="el-details__title">Save your spot</h1>
        <p className="el-join__lead">It's free. Just tell us who's coming.</p>
        <EventSummary event={event} />
        <form className="el-join__form" onSubmit={submit}>
          <div className="el-join__row">
            <span id="spots-label">Spots</span>
            <div
              className="el-join__stepper"
              role="group"
              aria-labelledby="spots-label"
            >
              <button
                type="button"
                aria-label="One spot less"
                disabled={spots <= 1}
                onClick={() => setSpots((n) => Math.max(1, n - 1))}
              >
                <Minus aria-hidden="true" />
              </button>
              <output aria-live="polite">{spots}</output>
              <button
                type="button"
                aria-label="One spot more"
                disabled={spots >= MAX_SPOTS}
                onClick={() => setSpots((n) => Math.min(MAX_SPOTS, n + 1))}
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
          </div>
          <label className="el-join__field">
            Name
            <input
              name="name"
              autoComplete="name"
              required
              placeholder="Your name"
            />
          </label>
          <label className="el-join__field">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@email.com"
            />
          </label>
          <div className="el-join__total">
            <span>Total</span>
            <span className="el-card__free">Free</span>
          </div>
          <button type="submit" className="el-details__cta el-join__submit">
            Confirm my spot
          </button>
          <a className="el-details__map" href={`/events/${event.id}`}>
            Back to event
          </a>
        </form>
      </div>
    </main>
  );
}

/** Confirmation for a free event. */
export function FreeSuccess({
  event,
  spots,
}: {
  event: EventRecord;
  spots: number;
}) {
  return (
    <main className="event-details-page">
      <SiteNav showSearch={false} />
      <div className="el-details">
        <h1 className="el-details__title">You're in.</h1>
        <p className="el-join__lead">
          {spots} {spots === 1 ? "spot" : "spots"} saved. See you there.
        </p>
        <EventSummary event={event} />
        <div className="el-join__actions">
          <a className="el-details__cta" href="/my-tickets">
            See my tickets
          </a>
          <a className="el-details__map" href="/">
            Find more events
          </a>
        </div>
      </div>
    </main>
  );
}

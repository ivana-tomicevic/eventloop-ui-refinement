"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import SiteNav from "./site-nav";
import {
  eventDate,
  eventImage,
  eventImageAlt,
  eventLocation,
  findEvent,
  formatPrice,
  type EventRecord,
} from "./event-data";
import { readBookings, ticketLabel, type Booking } from "./booking";
import AddToCalendar from "./add-to-calendar";

/** My Tickets: every demo booking made in this browser. Styles: app/tickets.css. */
export default function MyTickets() {
  const [items, setItems] = useState<
    { booking: Booking; event: EventRecord }[] | null
  >(null);
  useEffect(() => {
    setItems(
      readBookings().flatMap((booking) => {
        const event = findEvent(booking.eventId);
        return event ? [{ booking, event }] : [];
      }),
    );
  }, []);

  return (
    <main className="event-details-page">
      <SiteNav showSearch={false} />
      <div className="el-details">
        <h1 className="el-tickets__title">My tickets</h1>
        {items === null ? (
          <p className="el-details__loading">Loading…</p>
        ) : items.length === 0 ? (
          <div className="el-empty">
            <h2>No tickets yet.</h2>
            <p>Find something good and grab a spot.</p>
            <a className="el-empty__cta" href="/">
              Explore events
            </a>
          </div>
        ) : (
          <ul className="el-tickets">
            {items.map(({ booking, event }) => (
              <li key={booking.id}>
                <article className="el-ticket">
                  <div className="el-ticket__thumb">
                    <Image
                      src={eventImage(event)}
                      alt={eventImageAlt(event)}
                      fill
                      sizes="120px"
                      className="object-cover"
                      // A missing photo leaves the placeholder behind it visible.
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  </div>
                  <div className="el-ticket__body">
                    <h2>
                      <a
                        className="el-ticket__link"
                        href={`/events/${event.id}`}
                      >
                        {event.title}
                      </a>
                    </h2>
                    <p>{eventLocation(event)}</p>
                    <p>{eventDate(event)}</p>
                    <p>{ticketLabel(booking.tickets, booking.free)}</p>
                  </div>
                  <div className="el-ticket__side">
                    <span className="el-ticket__status">
                      <CircleCheck aria-hidden="true" />
                      Confirmed
                    </span>
                    <span className="el-card__price">
                      {booking.free ? "Free" : formatPrice(booking.total)}
                    </span>
                    <AddToCalendar event={event} />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

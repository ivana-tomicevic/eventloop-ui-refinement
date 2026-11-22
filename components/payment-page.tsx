"use client";
import { useEffect, useState } from "react";
import { findEvent, eventPriceValue, type EventRecord } from "./event-data";
import { BookingPage, BookingEmpty, MAX_TICKETS, Payment } from "./booking";
import { requireAccount } from "./auth";

/** /checkout/payment?event=ID&tickets=N: simulated card payment for a paid event. */
export default function PaymentPage() {
  const [state, setState] = useState<{
    event: EventRecord | null;
    tickets: number;
  } | null>(null);
  useEffect(() => {
    // Tickets need an account (e.g. someone opened this URL directly).
    if (!requireAccount()) return;
    const params = new URLSearchParams(window.location.search);
    setState({
      event: findEvent(params.get("event") || "") ?? null,
      tickets: Number(params.get("tickets")) || 0,
    });
  }, []);

  if (!state)
    return (
      <BookingPage flow>
        <p className="el-details__loading">Loading…</p>
      </BookingPage>
    );
  const { event, tickets } = state;
  const price = event ? eventPriceValue(event) : null;
  if (!event || !price || tickets < 1 || tickets > MAX_TICKETS)
    return (
      <BookingEmpty
        title="Nothing to pay for yet."
        text="Pick an event and your tickets first."
        href={event ? `/events/${event.id}` : "/"}
        label={event ? "Back to event" : "Explore events"}
      />
    );
  return <Payment event={event} unitPrice={price} tickets={tickets} />;
}

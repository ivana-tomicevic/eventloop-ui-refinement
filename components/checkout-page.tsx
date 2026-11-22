"use client";
import { useEffect, useState } from "react";
import {
  findEvent,
  eventPriceValue,
  isFree,
  type EventRecord,
} from "./event-data";
import { BookingPage, BookingEmpty, FreeJoin, PaidCheckout } from "./booking";
import { requireAccount } from "./auth";

/** /checkout?event=ID[&tickets=N]: "Save your spot" for free events, how many tickets for paid ones (for the signed-in account). */
export default function CheckoutPage() {
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
      tickets: Number(params.get("tickets")) || 1,
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
  if (!event || price === null)
    return (
      <BookingEmpty
        title="Event not found"
        text="It may have ended or moved. Plenty more is on."
        href="/"
        label="Back to Explore"
      />
    );
  if (isFree(event)) return <FreeJoin event={event} />;
  return (
    <PaidCheckout event={event} unitPrice={price} initialTickets={tickets} />
  );
}

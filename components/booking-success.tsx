"use client";
import { useEffect, useState } from "react";
import { findEvent, type EventRecord } from "./event-data";
import {
  BookingPage,
  BookingConfirmed,
  BookingEmpty,
  readLastBooking,
  type Booking,
} from "./booking";

/** /booking/success?event=ID: confirmation for the last booking of this event (free or paid). */
export default function BookingSuccess() {
  const [state, setState] = useState<{
    event: EventRecord | null;
    booking: Booking | null;
  } | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("event") || "";
    setState({ event: findEvent(id) ?? null, booking: readLastBooking(id) });
  }, []);

  if (!state)
    return (
      <BookingPage>
        <p className="el-details__loading">Loading…</p>
      </BookingPage>
    );
  if (!state.event || !state.booking)
    return (
      <BookingEmpty
        title="No booking to show."
        text="Find something good and grab a spot."
        href="/"
        label="Explore events"
      />
    );
  return <BookingConfirmed event={state.event} booking={state.booking} />;
}

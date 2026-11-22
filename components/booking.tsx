"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import SiteNav from "./site-nav";
import OnboardingShell from "./onboarding-shell";
import FieldError from "./field-error";
import { accountName, currentUserId } from "./auth";
import {
  eventDate,
  eventImage,
  eventImageAlt,
  eventLocation,
  formatPrice,
  type EventRecord,
} from "./event-data";

/**
 * Booking flow (demo, no backend): free "Save your spot", paid checkout -> payment, confirmation.
 * All steps sit in the shared centred card (OnboardingShell). Checkout and payment get a slim
 * header (logo + "Back to event"); the confirmation gets the full header back.
 * Styles: app/details.css (.el-join*), app/tickets.css (.el-pay*, .el-booking*). Tokens only.
 */

export const MAX_TICKETS = 4;
const ORDER_KEY = "eventloop-demo-order"; // last confirmed booking (confirmation page)
const TICKETS_KEY = "eventloop-demo-tickets"; // all bookings in this browser (My Tickets)

export type Booking = {
  id: string;
  eventId: string;
  tickets: number;
  total: number; // euros
  free: boolean;
  confirmed: true;
};

/** A new order id, made once when the order is confirmed. */
const newBookingId = () =>
  `EL-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

/**
 * Confirm button: one order id per screen, and only the first click counts (the button is
 * disabled after it).
 */
function useConfirmOnce() {
  const id = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const once = (confirm: (id: string) => void) => {
    if (id.current) return;
    id.current = newBookingId();
    setBusy(true);
    confirm(id.current);
  };
  return { busy, once };
}

/**
 * Saves a confirmed booking for the confirmation page and My Tickets, then opens the confirmation.
 * Idempotent: an id that is already saved doesn't add another row.
 */
export function confirmBooking(
  id: string,
  event: EventRecord,
  tickets: number,
  total: number,
) {
  const booking: Booking = {
    id,
    eventId: String(event.id),
    tickets,
    total,
    free: total === 0,
    confirmed: true,
  };
  try {
    const saved = readBookings();
    if (!saved.some((b) => b.id === id))
      localStorage.setItem(TICKETS_KEY, JSON.stringify([booking, ...saved]));
    localStorage.setItem(ORDER_KEY, JSON.stringify(booking));
  } catch {}
  window.location.assign(
    `/booking/success?event=${encodeURIComponent(booking.eventId)}`,
  );
}

/** The last confirmed booking, if it belongs to this event. */
export function readLastBooking(eventId: string): Booking | null {
  try {
    const b = JSON.parse(localStorage.getItem(ORDER_KEY) || "null");
    if (!b?.confirmed || String(b.eventId) !== eventId) return null;
    return normalise(b);
  } catch {
    return null;
  }
}

export function readBookings(): Booking[] {
  try {
    const list = JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]");
    return Array.isArray(list) ? list.map(normalise) : [];
  } catch {
    return [];
  }
}

/** Accepts the old demo order shape ({quantities: {general, vip, student}}) too. */
function normalise(raw: Record<string, unknown>): Booking {
  const q = (raw.quantities || {}) as Record<string, number>;
  const tickets =
    Number(raw.tickets) ||
    Object.values(q).reduce((sum, n) => sum + (Number(n) || 0), 0) ||
    1;
  const total = Number(raw.total) || 0;
  return {
    id: String(raw.id || raw.orderId || raw.eventId),
    eventId: String(raw.eventId),
    tickets,
    total,
    free: Boolean(raw.free) || total === 0,
    confirmed: true,
  };
}

export const ticketLabel = (n: number, free: boolean) =>
  `${n} ${free ? (n === 1 ? "spot" : "spots") : n === 1 ? "ticket" : "tickets"}`;

/* ---------- Shared pieces ---------- */

/** Checkout and payment: logo + "Back to event" only, so nothing pulls people out mid-purchase. */
function FlowHeader() {
  const [back, setBack] = useState("/");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("event");
    if (id) setBack(`/events/${encodeURIComponent(id)}`);
  }, []);
  return (
    <header className="el-nav">
      <a className="el-nav__logo" href="/">
        <span className="el-nav__mark" aria-hidden="true">
          e
        </span>
        <span className="el-nav__wordmark">eventloop</span>
      </a>
      <span className="el-nav__spacer" />
      <a className="el-nav__link el-nav__back" href={back}>
        <ArrowLeft aria-hidden="true" />
        Back to event
      </a>
    </header>
  );
}

/** The shared centred card. `flow`: checkout/payment header; otherwise the full header. */
export function BookingPage({
  flow = false,
  labelledBy,
  className,
  children,
}: {
  flow?: boolean;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <OnboardingShell
      header={flow ? <FlowHeader /> : <SiteNav showSearch={false} />}
      labelledBy={labelledBy}
      className={className}
    >
      {children}
    </OnboardingShell>
  );
}

export function EventSummary({ event }: { event: EventRecord }) {
  return (
    <div className="el-join__event">
      <div className="el-join__thumb">
        <Image
          src={eventImage(event)}
          alt={eventImageAlt(event)}
          fill
          sizes="96px"
          className="object-cover"
          // A missing photo leaves the placeholder behind it visible.
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      </div>
      <div>
        <h2>{event.title}</h2>
        <p>{eventLocation(event)}</p>
        <p>{eventDate(event)}</p>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div className="el-join__row">
      <span id="count-label">
        {label}
        {hint && <small className="el-join__hint">{hint}</small>}
      </span>
      <div
        className="el-join__stepper"
        role="group"
        aria-labelledby="count-label"
      >
        <button
          type="button"
          aria-label={`One ${label.toLowerCase().replace(/s$/, "")} less`}
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus aria-hidden="true" />
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          aria-label={`One ${label.toLowerCase().replace(/s$/, "")} more`}
          disabled={value >= MAX_TICKETS}
          onClick={() => onChange(Math.min(MAX_TICKETS, value + 1))}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Who the booking is for: the signed-in account (checkout always needs one). */
function TicketHolder({ free }: { free: boolean }) {
  const [who] = useState(() => ({
    name: accountName(),
    email: currentUserId(),
  }));
  return (
    <p className="el-join__holder">
      <span>
        {free ? "Spots" : "Tickets"} for {who.name}
      </span>
      <span className="el-join__hint">Sent to {who.email}</span>
    </p>
  );
}

function Total({ total }: { total: number }) {
  return (
    <div className="el-join__total">
      <span>Total</span>
      {total === 0 ? (
        <span className="el-card__free">Free</span>
      ) : (
        <span className="el-card__price">{formatPrice(total)}</span>
      )}
    </div>
  );
}

/* ---------- Free event: one step ---------- */

export function FreeJoin({ event }: { event: EventRecord }) {
  const [spots, setSpots] = useState(1);
  const { busy, once } = useConfirmOnce();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    once((id) => confirmBooking(id, event, spots, 0));
  };
  return (
    <BookingPage flow labelledBy="booking-title">
      <h1 id="booking-title" className="el-shell__title">
        Save your spot
      </h1>
      <p className="el-join__lead">It's free. Just pick how many.</p>
      <EventSummary event={event} />
      <form className="el-join__form" onSubmit={submit}>
        <Stepper label="Spots" value={spots} onChange={setSpots} />
        <TicketHolder free />
        <Total total={0} />
        <button
          type="submit"
          className="el-details__cta el-join__submit"
          disabled={busy}
        >
          Confirm my spot
        </button>
      </form>
    </BookingPage>
  );
}

/* ---------- Paid event, step 1: how many tickets ---------- */

export function PaidCheckout({
  event,
  unitPrice,
  initialTickets = 1,
}: {
  event: EventRecord;
  unitPrice: number;
  initialTickets?: number;
}) {
  const [tickets, setTickets] = useState(
    Math.min(MAX_TICKETS, Math.max(1, initialTickets)),
  );
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.assign(
      `/checkout/payment?event=${encodeURIComponent(String(event.id))}&tickets=${tickets}`,
    );
  };
  return (
    <BookingPage flow labelledBy="booking-title">
      <h1 id="booking-title" className="el-shell__title">
        Get your tickets
      </h1>
      <p className="el-join__lead">Pick how many, then pay. Takes a minute.</p>
      <EventSummary event={event} />
      <form className="el-join__form" onSubmit={submit}>
        <Stepper
          label="Tickets"
          value={tickets}
          onChange={setTickets}
          hint={`${formatPrice(unitPrice)} each`}
        />
        <TicketHolder free={false} />
        <Total total={unitPrice * tickets} />
        <button type="submit" className="el-details__cta el-join__submit">
          Continue to payment
        </button>
      </form>
    </BookingPage>
  );
}

/* ---------- Paid event, step 2: simulated card payment ---------- */

const digits = (v: string) => v.replace(/\D/g, "");
const formatCard = (v: string) =>
  digits(v)
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
const formatExpiry = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

type CardErrors = Partial<Record<"card" | "expiry" | "cvc", string>>;
function validateCard(card: string, expiry: string, cvc: string) {
  const errors: CardErrors = {};
  if (digits(card).length !== 16) errors.card = "Enter all 16 digits.";
  const month = Number(expiry.slice(0, 2));
  if (!/^\d{2}\/\d{2}$/.test(expiry) || month < 1 || month > 12)
    errors.expiry = "Use MM/YY.";
  if (digits(cvc).length !== 3) errors.cvc = "3 digits, on the back.";
  return errors;
}

function CardField({
  id,
  label,
  error,
  ...input
}: {
  id: "card" | "expiry" | "cvc";
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="el-join__field" htmlFor={`pay-${id}`}>
      {label}
      <input
        id={`pay-${id}`}
        inputMode="numeric"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `pay-${id}-error` : undefined}
        {...input}
      />
      {error && <FieldError id={`pay-${id}-error`}>{error}</FieldError>}
    </label>
  );
}

export function Payment({
  event,
  unitPrice,
  tickets,
}: {
  event: EventRecord;
  unitPrice: number;
  tickets: number;
}) {
  const total = unitPrice * tickets;
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<CardErrors>({});
  const { busy, once } = useConfirmOnce();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateCard(card, expiry, cvc);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = (["card", "expiry", "cvc"] as const).find((k) => found[k]);
      document.getElementById(`pay-${first}`)?.focus();
      return;
    }
    once((id) => confirmBooking(id, event, tickets, total));
  };
  return (
    <BookingPage flow labelledBy="booking-title">
      <h1 id="booking-title" className="el-shell__title">
        Pay for your tickets
      </h1>
      <p className="el-join__lead">Almost there.</p>
      <EventSummary event={event} />
      <form className="el-join__form" onSubmit={submit} noValidate>
        <div className="el-join__row">
          <span>{ticketLabel(tickets, false)}</span>
          <span className="el-pay__each">{formatPrice(unitPrice)} each</span>
        </div>
        <CardField
          id="card"
          label="Card number"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={card}
          error={errors.card}
          onChange={(e) => setCard(formatCard(e.target.value))}
        />
        <div className="el-pay__row">
          <CardField
            id="expiry"
            label="Expiry"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            error={errors.expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
          <CardField
            id="cvc"
            label="CVC"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            error={errors.cvc}
            onChange={(e) => setCvc(digits(e.target.value).slice(0, 3))}
          />
        </div>
        <Total total={total} />
        <button
          type="submit"
          className="el-details__cta el-join__submit"
          disabled={busy}
        >
          Pay {formatPrice(total)}
        </button>
        <p className="el-pay__demo">Demo checkout. No real payment.</p>
        <a
          className="el-details__map"
          href={`/checkout?event=${encodeURIComponent(String(event.id))}&tickets=${tickets}`}
        >
          Back to tickets
        </a>
      </form>
    </BookingPage>
  );
}

/* ---------- Confirmation (free and paid) ---------- */

export function BookingConfirmed({
  event,
  booking,
}: {
  event: EventRecord;
  booking: Booking;
}) {
  return (
    <BookingPage labelledBy="booking-title" className="el-booking-done">
      <span className="el-allset__check" aria-hidden="true">
        <Check />
      </span>
      <h1 id="booking-title" className="el-shell__title">
        {"You're in."}
      </h1>
      <p className="el-shell__lead">
        {booking.free
          ? booking.tickets === 1
            ? "Your spot is saved."
            : "Your spots are saved."
          : `Payment confirmed. ${ticketLabel(booking.tickets, false)} for ${event.title}.`}
      </p>
      <EventSummary event={event} />
      {booking.free ? (
        <span className="el-card__free">Free</span>
      ) : (
        <p className="el-booking-done__paid">
          Paid{" "}
          <span className="el-card__price">{formatPrice(booking.total)}</span>
        </p>
      )}
      <div className="el-allset__actions">
        <a className="el-details__cta el-join__submit" href="/my-tickets">
          See my tickets
        </a>
        <a className="el-shell__skip" href="/">
          Find more events
        </a>
      </div>
      {!booking.free && (
        <p className="el-pay__demo">
          {booking.tickets === 1
            ? "Your ticket is saved in My Tickets."
            : "Your tickets are saved in My Tickets."}
        </p>
      )}
    </BookingPage>
  );
}

/** Shown when a booking step is opened without an event or a booking. */
export function BookingEmpty({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <BookingPage>
      <div className="el-empty">
        <h2>{title}</h2>
        <p>{text}</p>
        <a className="el-empty__cta" href={href}>
          {label}
        </a>
      </div>
    </BookingPage>
  );
}

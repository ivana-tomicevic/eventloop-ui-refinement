"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, X } from "lucide-react";
import OrganizerNav from "./organizer-nav";
import EventCard from "./event-card";
import { readBookings } from "./booking";
import { isMine } from "./host";
import { useDismiss } from "./use-dismiss";
import {
  formatPrice,
  getEvents,
  saveEvent,
  type EventRecord,
} from "./event-data";

type Sales = Record<string, { tickets: number; revenue: number }>;
const NOTICE_MS = 4000;
const STORAGE_FULL = "Couldn't save. Your browser storage is full.";

/** "⋯" on a published card: Move to drafts, Delete. */
function MoreMenu({
  event,
  onDraft,
  onDelete,
}: {
  event: EventRecord;
  onDraft: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close, buttonRef);
  const id = `more-${event.id}`;
  return (
    <div className="el-org__more" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className="el-org__icon"
        aria-label={`More actions for ${event.title}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal aria-hidden="true" />
      </button>
      {open && (
        <div className="el-nav__menu" id={id}>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDraft();
            }}
          >
            Move to drafts
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/** My events: stats from real demo data, then every event as an Explore card with status and actions. */
export default function MyEventsPage() {
  const [events, setEvents] = useState<EventRecord[] | null>(null);
  const [sales, setSales] = useState<Sales>({});
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    const mine = getEvents().filter(isMine);
    setEvents(mine);
    const ids = new Set(mine.map((e) => String(e.id)));
    const next: Sales = {};
    for (const b of readBookings()) {
      if (!ids.has(b.eventId)) continue;
      const s = (next[b.eventId] ||= { tickets: 0, revenue: 0 });
      s.tickets += b.tickets;
      s.revenue += b.total;
    }
    setSales(next);
  };
  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("published")) setNotice("Published. It's live on Explore.");
    else if (params.get("saved"))
      setNotice("Draft saved. Only you can see it.");
    // A notice belongs to this visit only: drop it from the URL so a reload doesn't repeat it.
    if (params.get("published") || params.get("saved"))
      window.history.replaceState(null, "", window.location.pathname);
  }, []);
  // Notices close by themselves after 4 s (and with ×).
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [notice]);

  const setStatus = (event: EventRecord, status: "Published" | "Draft") => {
    if (!saveEvent({ ...event, status })) {
      setNotice(STORAGE_FULL);
      return;
    }
    setNotice(
      status === "Published"
        ? `${event.title} is live on Explore.`
        : `${event.title} is back in drafts.`,
    );
    load();
  };
  const remove = (event: EventRecord) => {
    const ok = saveEvent({ ...event, deleted: true });
    setConfirmDelete(null);
    if (!ok) {
      setNotice(STORAGE_FULL);
      return;
    }
    setNotice(`${event.title} was deleted.`);
    load();
  };

  const published = events?.filter((e) => e.status !== "Draft").length ?? 0;
  const drafts = events?.filter((e) => e.status === "Draft").length ?? 0;
  const soldTickets = Object.values(sales).reduce((n, s) => n + s.tickets, 0);
  const revenue = Object.values(sales).reduce((n, s) => n + s.revenue, 0);

  return (
    <main className="event-details-page">
      <OrganizerNav />
      <div className="el-org">
        <header className="el-org__head">
          <h1 className="el-tickets__title">My events</h1>
          {events && events.length > 0 && (
            <a className="el-details__cta" href="/organizer/create">
              Create an event
            </a>
          )}
        </header>

        <div role="status" aria-live="polite">
          {notice && (
            <p className="el-org__notice">
              <span>{notice}</span>
              <button
                type="button"
                className="el-org__icon"
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X aria-hidden="true" />
              </button>
            </p>
          )}
        </div>

        {events === null ? (
          <p className="el-details__loading">Loading…</p>
        ) : events.length === 0 ? (
          <div className="el-empty">
            <h2>Host your first event</h2>
            <p>Add the basics and it shows up on Explore.</p>
            <a className="el-empty__cta" href="/organizer/create">
              Create an event
            </a>
          </div>
        ) : (
          <>
            <dl className="el-org__stats">
              <div>
                <dt>Published</dt>
                <dd>{published}</dd>
              </div>
              <div>
                <dt>Drafts</dt>
                <dd>{drafts}</dd>
              </div>
              <div>
                <dt>Tickets sold</dt>
                <dd>{soldTickets}</dd>
              </div>
              <div>
                <dt>Revenue</dt>
                <dd>{revenue ? formatPrice(revenue) : "€0"}</dd>
              </div>
            </dl>
            <ul className="el-grid el-org__list">
              {events.map((event) => {
                const id = String(event.id);
                const draft = event.status === "Draft";
                const s = sales[id];
                const editLink = (
                  <a
                    className="el-org__icon"
                    href={`/organizer/create?edit=${encodeURIComponent(id)}`}
                    aria-label={`Edit ${event.title}`}
                    title="Edit"
                  >
                    <Pencil aria-hidden="true" />
                  </a>
                );
                return (
                  <li key={id} className="el-org__item">
                    <EventCard
                      event={event}
                      note={
                        s
                          ? `${s.tickets} ${s.tickets === 1 ? "ticket" : "tickets"}${s.revenue ? ` · ${formatPrice(s.revenue)}` : ""}`
                          : "No tickets sold yet"
                      }
                      actions={
                        <>
                          <span
                            className={
                              "el-org__status" +
                              (draft ? " el-org__status--draft" : "")
                            }
                          >
                            {draft ? "Draft" : "Published"}
                          </span>
                          {confirmDelete === id ? (
                            <div
                              className="el-org__actions"
                              role="group"
                              aria-label={`Delete ${event.title}?`}
                            >
                              <span className="el-org__ask">Delete?</span>
                              <button
                                type="button"
                                className="el-org__btn el-org__btn--danger"
                                onClick={() => remove(event)}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                className="el-org__btn"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Keep
                              </button>
                            </div>
                          ) : draft ? (
                            <div className="el-org__actions">
                              {editLink}
                              <button
                                type="button"
                                className="el-org__btn el-org__btn--ghost"
                                onClick={() => setStatus(event, "Published")}
                              >
                                Publish
                              </button>
                            </div>
                          ) : (
                            <div className="el-org__actions">
                              {editLink}
                              <MoreMenu
                                event={event}
                                onDraft={() => setStatus(event, "Draft")}
                                onDelete={() => setConfirmDelete(id)}
                              />
                            </div>
                          )}
                        </>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

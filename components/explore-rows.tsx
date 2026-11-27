"use client";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import EventCard from "./event-card";
import { eventPriceValue, type EventRecord } from "./event-data";
import {
  NEIGHBOURHOOD_PLACES,
  UNIVERSITY_PLACES,
  distanceTo,
  readNear,
  saveNear,
  type Place,
} from "./places";

/**
 * Explore on Tomorrow, Weekend and All: rows named by intent instead of one long grid.
 * "No plus-one needed" (hosts who welcome people coming alone), "Free or under €5" and
 * "Close to you". An event shows once on the screen, in the first row it fits.
 * "Close to you" asks for the location only after a tap on "Use my location"; a neighbourhood
 * or university picker is the fallback. Distances only sort the row, they are never shown.
 * Each row shows three cards; "Show all" opens the rest of that row (no sideways scrolling).
 * Styles: app/explore-rows.css.
 */
const ROW_MAX = 3;

function Row({
  id,
  title,
  text,
  action,
  children,
}: {
  id: string;
  title: string;
  text: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="el-row" aria-labelledby={id}>
      {/* The shared section header: title + right slot, then the sub line (app/explore-results.css) */}
      <div className="el-sec">
        <h2 id={id}>{title}</h2>
        {action && <span className="el-sec__aside">{action}</span>}
      </div>
      <p className="el-sec__sub">{text}</p>
      {children}
    </section>
  );
}

export default function ExploreRows({
  events,
  saved,
  onSave,
}: {
  /** Events of the chosen tab, soonest first. */
  events: EventRecord[];
  saved: string[];
  onSave: (id: string | number) => void;
}) {
  const [near, setNear] = useState<Place | null>(null);
  const [picking, setPicking] = useState(false);
  const [denied, setDenied] = useState(false);
  /** Rows opened with "Show all" */
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => setNear(readNear()), []);

  const choose = (p: Place | null) => {
    setNear(p);
    saveNear(p);
    setPicking(false);
    setDenied(false);
  };
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setPicking(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        choose({
          label: "Your location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {
        setDenied(true);
        setPicking(true);
      },
      { timeout: 8000 },
    );
  };

  const used = new Set<string>();
  const take = (list: EventRecord[]) => {
    const rows = list.filter((e) => !used.has(String(e.id)));
    rows.forEach((e) => used.add(String(e.id)));
    return rows;
  };
  const solo = take(events.filter((e) => e.soloFriendly));
  const cheap = take(
    events.filter((e) => {
      const p = eventPriceValue(e);
      return p !== null && p < 5;
    }),
  );
  const nearList = near
    ? take(
        [...events].sort(
          (a, b) =>
            distanceTo(near, a.neighbourhood) -
            distanceTo(near, b.neighbourhood),
        ),
      )
    : [];
  /** Three cards; "Show all" (in the row header) adds the rest of the row. */
  const rail = (list: EventRecord[], id: string) => (
    <div className="el-rail">
      {(open[id] ? list : list.slice(0, ROW_MAX)).map((e) => (
        <EventCard
          key={e.id}
          event={e}
          saved={saved.includes(String(e.id))}
          onSave={onSave}
        />
      ))}
    </div>
  );

  /** "Show all 6 →": a quiet action in the row header. It opens the rest of the row in place,
   *  so it is a button with aria-expanded; the label names the section. */
  const toggle = (id: string, list: EventRecord[], title: string) =>
    list.length > ROW_MAX ? (
      <button
        type="button"
        className="el-sec__more"
        aria-expanded={Boolean(open[id])}
        aria-label={
          open[id]
            ? `Show fewer events: ${title}`
            : `Show all ${list.length} events: ${title}`
        }
        onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}
      >
        {open[id] ? "Show fewer" : `Show all ${list.length}`}
        <ArrowRight aria-hidden="true" />
      </button>
    ) : undefined;

  return (
    <div className="el-rows">
      {solo.length > 0 && (
        <Row
          id="row-solo"
          title="No plus-one needed"
          text="Come on your own, or bring a friend."
          action={toggle("solo", solo, "No plus-one needed")}
        >
          {rail(solo, "solo")}
        </Row>
      )}
      {cheap.length > 0 && (
        <Row
          id="row-cheap"
          title="Free or under €5"
          text="Good nights that don't cost much."
          action={toggle("cheap", cheap, "Free or under €5")}
        >
          {rail(cheap, "cheap")}
        </Row>
      )}
      <Row
        id="row-near"
        title="Close to you"
        text={
          near ? (
            <>Nearest first · {near.label}</>
          ) : (
            "Find what is on near you."
          )
        }
        action={
          near && !picking ? (
            <>
              <button
                type="button"
                className="el-sec__clear"
                onClick={() => setPicking(true)}
              >
                Change
              </button>
              {toggle("near", nearList, "Close to you")}
            </>
          ) : undefined
        }
      >
        {picking ? (
          <div className="el-near" role="group" aria-label="Where should we look?">
            <h3>Where should we look?</h3>
            {denied && (
              <p className="el-near__note">
                {"We couldn't get your location. Pick a place instead."}
              </p>
            )}
            <p className="el-near__label">Neighbourhoods</p>
            <div className="el-near__chips">
              {NEIGHBOURHOOD_PLACES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="el-near__chip"
                  onClick={() => choose(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="el-near__label">Universities</p>
            <div className="el-near__chips">
              {UNIVERSITY_PLACES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="el-near__chip"
                  onClick={() => choose(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : near ? (
          nearList.length > 0 ? (
            rail(nearList, "near")
          ) : (
            <p className="el-near__note">
              Everything on this tab is already above.
            </p>
          )
        ) : (
          <div className="el-near">
            <h3>See what is on near you</h3>
            <p>
              Allow your location to sort events by how close they are. You can
              change this any time.
            </p>
            <div className="el-near__actions">
              <button
                type="button"
                className="el-details__cta"
                onClick={useMyLocation}
              >
                Use my location
              </button>
              <button
                type="button"
                className="el-org__btn"
                onClick={() => setPicking(true)}
              >
                Choose a neighbourhood or university
              </button>
            </div>
          </div>
        )}
      </Row>
    </div>
  );
}

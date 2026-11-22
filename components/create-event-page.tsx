"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ChevronDown, ImagePlus } from "lucide-react";
import OrganizerNav from "./organizer-nav";
import EventCard from "./event-card";
import { CATEGORIES, NEIGHBOURHOODS } from "./vibes";
import { findEvent, saveEvent, type EventRecord } from "./event-data";
import { currentUserId } from "./auth";
import { isMine } from "./host";
import FieldError from "./field-error";

const MAX_PHOTO_BYTES = 1_500_000;

type Form = {
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, 24h
  venue: string;
  neighbourhood: string;
  price: string; // euros, "0" = Free
  description: string;
  image: string; // data URL or /path
};
type Field = keyof Form;
type Errors = Partial<Record<Field, string>>;

const empty: Form = {
  title: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  neighbourhood: "",
  price: "",
  description: "",
  image: "",
};
const ORDER: Field[] = [
  "title",
  "category",
  "date",
  "time",
  "venue",
  "neighbourhood",
  "price",
  "description",
  "image",
];

const pad = (n: number) => String(n).padStart(2, "0");
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const priceNumber = (v: string) => Number(v.trim().replace(",", "."));

function validate(f: Form, publishing: boolean): Errors {
  const e: Errors = {};
  if (!f.title.trim()) e.title = "Give it a name.";
  if (!publishing) return e;
  if (!f.category) e.category = "Pick a category.";
  if (!f.date) e.date = "Pick a date.";
  else if (f.date < today()) e.date = "Pick today or a later date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.time))
    e.time = "Use 24h time, like 20:30.";
  if (!f.venue.trim()) e.venue = "Where is it happening?";
  if (!f.neighbourhood) e.neighbourhood = "Pick a neighbourhood.";
  if (!/^\d+([.,]\d{1,2})?$/.test(f.price.trim()))
    e.price = "Enter a price in euros. 0 means Free.";
  if (f.description.trim().length < 20)
    e.description = "Tell people what to expect (20+ characters).";
  if (!f.image) e.image = "Add a cover photo.";
  return e;
}

/** Turns the form into the same record Explore, details and checkout read. */
function toEvent(
  f: Form,
  id: string,
  status: "Published" | "Draft",
  base?: EventRecord,
): EventRecord {
  const price = f.price.trim() ? String(priceNumber(f.price)) : base?.price;
  return {
    ...base,
    id,
    title: f.title.trim() || "Untitled event",
    category: f.category || base?.category,
    start: f.date && f.time ? `${f.date}T${f.time}` : base?.start,
    venue: f.venue.trim() || undefined,
    neighbourhood: f.neighbourhood || undefined,
    price: price && Number.isFinite(Number(price)) ? price : undefined,
    summary: f.description.trim().split(/(?<=[.!?])\s/)[0] || undefined,
    description: f.description.trim() || undefined,
    image: f.image || undefined,
    status,
    ownerId: base?.ownerId || currentUserId(),
    deleted: false,
  };
}

export default function CreateEventPage() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const idRef = useRef(`ev-${Date.now().toString(36)}`);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    // Only your own events can be edited (not the demo host's).
    const found = id ? findEvent(id) : undefined;
    const existing = found && isMine(found) ? found : undefined;
    if (!existing) return;
    idRef.current = String(existing.id);
    setEditing(existing);
    const [date = "", time = ""] = (existing.start || "").split("T");
    setForm({
      title: existing.title || "",
      category: existing.category || "",
      date,
      time: time.slice(0, 5),
      venue: existing.venue || existing.location || "",
      neighbourhood: existing.neighbourhood || "",
      price: existing.price ?? "",
      description: existing.description || existing.summary || "",
      image: existing.image || "",
    });
  }, []);

  const set = <K extends Field>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const preview = useMemo(
    () => ({
      ...toEvent(form, "preview", "Draft", editing ?? undefined),
      title: form.title.trim() || "Your event title",
      venue: form.venue.trim() || "Venue",
      neighbourhood: form.neighbourhood || "Neighbourhood",
      // Neutral placeholder until a photo is added (not another event's photo)
      image: form.image || "/eventloop-gallery-card.jpg",
    }),
    [form, editing],
  );

  const submit = (status: "Published" | "Draft") => (e?: FormEvent) => {
    e?.preventDefault();
    const found = validate(form, status === "Published");
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(`ev-${first}`)?.focus();
      return;
    }
    saveEvent(toEvent(form, idRef.current, status, editing ?? undefined));
    window.location.assign(
      `/organizer/events?${status === "Published" ? "published" : "saved"}=${encodeURIComponent(idRef.current)}`,
    );
  };

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((e) => ({ ...e, image: "Photo must be under 1.5 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result));
    reader.readAsDataURL(file);
  };

  // Shared props for a field with an inline error under it.
  const described = (k: Field) => ({
    id: `ev-${k}`,
    "aria-invalid": Boolean(errors[k]),
    "aria-describedby": errors[k] ? `ev-${k}-error` : undefined,
  });
  const error = (k: Field) =>
    errors[k] ? (
      <FieldError id={`ev-${k}-error`}>{errors[k]}</FieldError>
    ) : null;
  const free = form.price.trim() !== "" && priceNumber(form.price) === 0;

  return (
    <main className="event-details-page">
      <OrganizerNav />
      <div className="el-org">
        <a className="el-details__map el-create__back" href="/organizer">
          <span aria-hidden="true">←</span> My events
        </a>
        <h1 className="el-tickets__title">
          {editing ? "Edit your event" : "Create an event"}
        </h1>
        <div className="el-create">
          <form
            className="el-join__form el-create__form"
            onSubmit={submit("Published")}
            noValidate
          >
            <label className="el-join__field">
              Title
              <input
                {...described("title")}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Rooftop Salsa Night"
                maxLength={60}
              />
              {error("title")}
            </label>

            <fieldset
              className="el-create__fieldset"
              aria-describedby={
                errors.category ? "ev-category-error" : undefined
              }
            >
              <legend>Category</legend>
              <div className="el-vibes__row el-create__vibes">
                {CATEGORIES.map((v, i) => (
                  <button
                    type="button"
                    key={v.id}
                    id={i === 0 ? "ev-category" : undefined}
                    className={`el-vibe el-vibe--${v.tone}`}
                    aria-pressed={form.category === v.id}
                    onClick={() => set("category", v.id)}
                  >
                    <v.icon aria-hidden="true" />
                    {v.label}
                  </button>
                ))}
              </div>
              {error("category")}
            </fieldset>

            <div className="el-pay__row">
              <label className="el-join__field">
                Date
                <input
                  {...described("date")}
                  type="date"
                  min={today()}
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
                {error("date")}
              </label>
              <label className="el-join__field">
                Time (24h)
                <input
                  {...described("time")}
                  inputMode="numeric"
                  placeholder="20:30"
                  maxLength={5}
                  value={form.time}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    set(
                      "time",
                      d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d,
                    );
                  }}
                />
                {error("time")}
              </label>
            </div>

            <div className="el-pay__row">
              <label className="el-join__field">
                Venue
                <input
                  {...described("venue")}
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="Terraza Lumen"
                />
                {error("venue")}
              </label>
              <label className="el-join__field">
                Neighbourhood
                <span className="el-join__select">
                  <select
                    {...described("neighbourhood")}
                    value={form.neighbourhood}
                    onChange={(e) => set("neighbourhood", e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {NEIGHBOURHOODS.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </span>
                {error("neighbourhood")}
              </label>
            </div>

            <label className="el-join__field">
              Price (€)
              <input
                {...described("price")}
                inputMode="decimal"
                placeholder="12"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
              {error("price") || (
                <span className="el-join__hint">
                  {free ? "Shows as Free." : "0 shows as Free."}
                </span>
              )}
            </label>

            <label className="el-join__field">
              Description
              <textarea
                {...described("description")}
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What's the vibe? Who should come?"
              />
              {error("description")}
            </label>

            <div className="el-join__field">
              <span id="ev-image-label">Cover photo</span>
              <label className="el-create__upload" htmlFor="ev-image">
                <ImagePlus aria-hidden="true" />
                {form.image ? "Change photo" : "Add a photo"}
                <span className="el-join__hint">
                  JPG, PNG or WebP, up to 1.5 MB
                </span>
              </label>
              <input
                {...described("image")}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-labelledby="ev-image-label"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
              {error("image")}
            </div>

            <div className="el-create__actions">
              <button
                type="submit"
                className="el-details__cta el-create__publish"
              >
                Publish
              </button>
              <button
                type="button"
                className="el-org__btn el-create__draft"
                onClick={submit("Draft")}
              >
                Save draft
              </button>
            </div>
          </form>

          <aside className="el-create__preview" aria-label="Card preview">
            <p className="el-section-label">Preview</p>
            <EventCard event={preview} href={null} />
            <p className="el-join__hint">This is how it shows up on Explore.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

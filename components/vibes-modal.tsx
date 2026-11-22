"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { MOODS, readMyMoods, saveMyMoods } from "./moods";

const OPEN_EVENT = "eventloop-open-vibes";
/** Fired after the vibes change ("Save" here, a chip in Explore's "Find your vibe"). */
export const MOODS_CHANGED = "eventloop-moods-changed";

/** Opens "My vibes" from anywhere (account menu, Explore) without changing the route. */
export const openVibes = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** Saves the picked vibes and tells the open page (Explore re-ranks right away). */
export function setMyMoods(ids: string[]) {
  saveMyMoods(ids);
  window.dispatchEvent(new Event(MOODS_CHANGED));
}

const FOCUSABLE =
  'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * "What's your vibe?" — multi-select moods in a modal dialog.
 * Mounted once by the header for signed-in people. Focus is kept inside, Escape or the backdrop
 * closes it, the page behind doesn't scroll, and focus returns to what opened it.
 */
export default function VibesModal() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setPicked(readMyMoods());
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // After the page re-renders: back to the opener, or to the avatar when the opener is gone
    // (a menu item closes with the menu; "More" goes away once vibes are saved).
    requestAnimationFrame(() => {
      const o = opener.current;
      const back =
        o && o.isConnected && o !== document.body
          ? o
          : document.querySelector<HTMLElement>(".el-nav__avatar-button");
      back?.focus();
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialog.current) return;
      const items = [
        ...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const inside = dialog.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
    };
  }, [open, close]);

  if (!open) return null;

  const toggle = (id: string) =>
    setPicked((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  const save = () => {
    setMyMoods(picked);
    close();
  };

  return createPortal(
    <div
      className="el-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialog}
        className="el-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vibes-modal-title"
      >
        <div className="el-modal__head">
          <button
            type="button"
            className="el-org__icon el-modal__close"
            aria-label="Close"
            onClick={close}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="el-modal__body">
          <h2 id="vibes-modal-title" className="el-shell__title">
            {"What's your vibe?"}
          </h2>
          <p className="el-shell__lead">
            {"Pick a few. We'll line up the best matches."}
          </p>
          <div
            className="el-picks"
            role="group"
            aria-labelledby="vibes-modal-title"
          >
            {MOODS.map((m) => (
              <button
                type="button"
                key={m.id}
                className="el-pick"
                aria-pressed={picked.includes(m.id)}
                onClick={() => toggle(m.id)}
              >
                <m.icon aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="el-modal__bar">
          <span className="el-modal__count" aria-live="polite">
            {picked.length} selected
          </span>
          <button
            type="button"
            className="el-details__cta el-modal__save"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

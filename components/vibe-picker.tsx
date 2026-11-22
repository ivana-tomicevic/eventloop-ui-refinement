"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { VIBES, findVibe } from "./moods";

const FOCUSABLE = "button:not([disabled])";
const PANEL_ID = "vibe-panel";

/**
 * "[any vibe ▾]" in Explore's title: a pill that opens "What kind of night?" (one vibe at a time).
 * Picked: an ink pill with the vibe's icon and a separate "×" to clear it.
 * The panel sits under the pill on desktop and is a bottom sheet on phones. Focus stays inside
 * while it's open, arrows move between the vibes, Escape / "Close" / a click outside close it
 * and focus goes back to the pill. Styles: app/explore-header.css (.el-vibe-pick, .el-vibe-panel).
 */
export default function VibePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(
    null,
  );
  /** The panel is rendered next to the title, not inside the <h1> (Explore header). */
  const [host, setHost] = useState<HTMLElement | null>(null);
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const picked = findVibe(value);

  // Focus goes back to the pill before the panel goes away, so it never drops to the page.
  const close = useCallback((refocus = true) => {
    if (refocus) trigger.current?.focus();
    setOpen(false);
  }, []);

  useEffect(() => {
    setHost(
      root.current?.closest<HTMLElement>(".el-explore-header") || document.body,
    );
  }, []);

  // Desktop: under the pill, kept inside the page column. Phones: a bottom sheet (CSS).
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = trigger.current;
      const p = panel.current;
      const host = p?.offsetParent as HTMLElement | null;
      if (!t || !p || !host) return;
      const tr = t.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      const left = Math.max(
        0,
        Math.min(tr.left - hr.left, hr.width - p.offsetWidth),
      );
      setPlace({ top: tr.bottom - hr.top, left });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, host]);

  useEffect(() => {
    if (!open) return;
    const list = panel.current;
    (
      list?.querySelector<HTMLElement>(
        '.el-vibe-option[aria-pressed="true"]',
      ) || list?.querySelector<HTMLElement>(".el-vibe-option")
    )?.focus();
    // A click outside closes it (focus stays where the click went).
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !root.current?.contains(target))
        close(false);
    };
    // Bottom sheet: the page behind doesn't scroll.
    const sheet = window.matchMedia("(max-width: 720px)").matches;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    if (sheet) html.style.overflow = "hidden";
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      html.style.overflow = overflow;
    };
  }, [open, close]);

  const choose = (id: string) => {
    onChange(id);
    close();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    const items = [
      ...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) || []),
    ];
    const options = items.filter((el) =>
      el.classList.contains("el-vibe-option"),
    );
    const at = options.indexOf(document.activeElement as HTMLElement);
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && at >= 0) {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      options[(at + step + options.length) % options.length].focus();
      return;
    }
    if ((e.key === "Home" || e.key === "End") && at >= 0) {
      e.preventDefault();
      options[e.key === "Home" ? 0 : options.length - 1].focus();
      return;
    }
    // Focus stays inside while the panel is open.
    if (e.key === "Tab" && items.length) {
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <>
      <span
        ref={root}
        className={"el-vibe-pick" + (picked ? " el-vibe-pick--picked" : "")}
      >
        <button
          ref={trigger}
          type="button"
          className="el-vibe-pick__button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? PANEL_ID : undefined}
          onClick={() => (open ? close() : setOpen(true))}
        >
          {picked && (
            <picked.icon className="el-vibe-pick__icon" aria-hidden="true" />
          )}
          {picked ? picked.label : "any vibe"}
          {!picked && (
            <ChevronDown className="el-vibe-pick__chevron" aria-hidden="true" />
          )}
        </button>
        {picked && (
          <button
            type="button"
            className="el-vibe-pick__clear"
            aria-label="Clear vibe"
            onClick={() => {
              onChange("");
              trigger.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </span>
      {open &&
        host &&
        createPortal(
          <>
            <div className="el-vibe-panel__scrim" aria-hidden="true" />
            <div
              ref={panel}
              id={PANEL_ID}
              className="el-vibe-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vibe-panel-title"
              style={
                place
                  ? ({
                      "--vibe-panel-top": `${place.top}px`,
                      "--vibe-panel-left": `${place.left}px`,
                    } as CSSProperties)
                  : undefined
              }
              onKeyDown={onKeyDown}
            >
              <h2 id="vibe-panel-title" className="el-vibe-panel__title">
                What kind of night?
              </h2>
              <ul className="el-vibe-panel__list">
                {VIBES.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      className="el-vibe-option"
                      aria-pressed={v.id === value}
                      onClick={() => choose(v.id)}
                    >
                      <span className="el-vibe-option__icon" aria-hidden="true">
                        <v.icon />
                      </span>
                      <span className="el-vibe-option__text">
                        <span className="el-vibe-option__label">{v.label}</span>
                        <span className="el-vibe-option__hint">{v.hint}</span>
                      </span>
                      {v.id === value && (
                        <Check
                          className="el-vibe-option__check"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="el-vibe-panel__actions">
                <button
                  type="button"
                  className="el-vibe-panel__text"
                  onClick={() => choose("")}
                >
                  Any vibe
                </button>
                <button
                  type="button"
                  className="el-vibe-panel__text"
                  onClick={() => close()}
                >
                  Close
                </button>
              </div>
            </div>
          </>,
          host,
        )}
    </>
  );
}

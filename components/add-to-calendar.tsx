"use client";
import { useCallback, useId, useRef, useState } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";
import { useDismiss } from "./use-dismiss";
import type { EventRecord } from "./event-data";
import {
  canAddToCalendar,
  downloadIcs,
  googleCalendarUrl,
} from "@/lib/calendar";

/**
 * "Add to calendar": a secondary button with a small menu (Google Calendar link, .ics file).
 * Same menu pattern as the account menu: closes on a click outside, on Escape (focus back on
 * the button) and after a choice. Renders nothing when the event has no valid start.
 * Styles: app/tickets.css (.el-cal) on top of .el-org__btn and .el-nav__menu.
 */
export default function AddToCalendar({
  event,
  wide = false,
}: {
  event: EventRecord;
  /** Full width, e.g. under the confirmation's main button. */
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close, buttonRef);
  const menuId = useId();

  if (!canAddToCalendar(event)) return null;

  return (
    <div className={"el-cal" + (wide ? " el-cal--wide" : "")} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className="el-org__btn el-cal__button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarPlus aria-hidden="true" />
        Add to calendar
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div className="el-nav__menu el-cal__menu" id={menuId}>
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            Google Calendar
          </a>
          <button
            type="button"
            onClick={() => {
              downloadIcs(event);
              close();
              buttonRef.current?.focus();
            }}
          >
            Apple, Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

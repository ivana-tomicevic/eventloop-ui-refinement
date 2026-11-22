"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Check, ChevronDown, MapPin, X } from "lucide-react";
import { NEIGHBOURHOODS } from "./vibes";
import { useDismiss } from "./use-dismiss";

const ANYWHERE = "Anywhere in Madrid";
const LIST_ID = "area-list";

/**
 * "Anywhere in Madrid ▾" on Explore: one neighbourhood at a time ("" = anywhere).
 * A pill like the vibe control that opens a listbox. Arrows / Home / End move, Enter or Space
 * picks, Escape or a click outside closes (focus back on the pill). A picked area gets a "×".
 * Styles: app/explore-header.css (.el-area-pick, .el-area-list).
 */
export default function AreaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (area: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, root, close, button);

  // Opening puts focus on the picked option (or the first one).
  useEffect(() => {
    if (!open) return;
    (
      list.current?.querySelector<HTMLElement>('[aria-selected="true"]') ||
      list.current?.querySelector<HTMLElement>('[role="option"]')
    )?.focus();
  }, [open]);

  const choose = (area: string) => {
    onChange(area);
    button.current?.focus();
    setOpen(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    const options = [
      ...(list.current?.querySelectorAll<HTMLElement>('[role="option"]') || []),
    ];
    const at = options.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => {
      e.preventDefault();
      options[(i + options.length) % options.length]?.focus();
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(options.length - 1);
    else if ((e.key === "Enter" || e.key === " ") && at >= 0) {
      e.preventDefault();
      choose(options[at].dataset.value || "");
    } else if (e.key === "Tab") {
      // A listbox isn't a stop of its own: Tab closes it and leaves focus on the pill.
      e.preventDefault();
      button.current?.focus();
      setOpen(false);
    }
  };

  return (
    <div
      ref={root}
      className={"el-area-pick" + (value ? " el-area-pick--picked" : "")}
    >
      <button
        ref={button}
        type="button"
        className="el-area-pick__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? LIST_ID : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <MapPin className="el-area-pick__pin" aria-hidden="true" />
        {value || ANYWHERE}
        {!value && (
          <ChevronDown className="el-area-pick__chevron" aria-hidden="true" />
        )}
      </button>
      {value && (
        <button
          type="button"
          className="el-area-pick__clear"
          aria-label="Clear area"
          onClick={() => {
            onChange("");
            button.current?.focus();
          }}
        >
          <X aria-hidden="true" />
        </button>
      )}
      {open && (
        <ul
          ref={list}
          id={LIST_ID}
          className="el-area-list"
          role="listbox"
          aria-label="Neighbourhood"
          onKeyDown={onKeyDown}
        >
          {["", ...NEIGHBOURHOODS].map((area) => (
            <li
              key={area || "anywhere"}
              role="option"
              tabIndex={-1}
              aria-selected={area === value}
              data-value={area}
              className="el-area-list__option"
              onClick={() => choose(area)}
            >
              {area || ANYWHERE}
              {area === value && <Check aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

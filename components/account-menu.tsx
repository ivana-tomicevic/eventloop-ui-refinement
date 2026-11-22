"use client";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useDismiss } from "./use-dismiss";

export type MenuItem = {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon?: ReactNode;
  className?: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

/**
 * Avatar button + click-to-open menu (attendee and organizer headers).
 * Closes on a click outside, on Escape (focus back on the avatar) and after a choice.
 */
export default function AccountMenu({
  name,
  items,
}: {
  name: string;
  items: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close, buttonRef);

  return (
    <div className="el-nav__account" ref={ref}>
      <button
        ref={buttonRef}
        className="el-nav__avatar-button"
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="el-nav__avatar" aria-hidden="true">
          {initials(name)}
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="el-nav__menu" id="account-menu">
          {items.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className={item.className}
                onClick={(e) => {
                  setOpen(false);
                  item.onClick?.(e);
                }}
              >
                {item.icon}
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className={item.className}
                onClick={(e) => {
                  setOpen(false);
                  item.onClick?.(e);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

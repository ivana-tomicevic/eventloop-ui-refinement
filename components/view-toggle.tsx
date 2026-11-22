"use client";
import type { KeyboardEvent } from "react";

export type ExploreView = "list" | "timeline";
const OPTIONS: { id: ExploreView; label: string }[] = [
  { id: "list", label: "List" },
  { id: "timeline", label: "Timeline" },
];

/**
 * "List | Timeline" on Explore (Tonight only). A radio group: one tab stop, arrow keys switch.
 * Styles: app/explore-results.css (.el-view).
 */
export default function ViewToggle({
  value,
  onChange,
}: {
  value: ExploreView;
  onChange: (view: ExploreView) => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    const at = OPTIONS.findIndex((o) => o.id === value);
    const next = (at + step + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[next].id);
    e.currentTarget
      .querySelectorAll<HTMLElement>('[role="radio"]')
      [next]?.focus();
  };
  return (
    <div
      className="el-view"
      role="radiogroup"
      aria-label="View"
      onKeyDown={onKeyDown}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          tabIndex={value === o.id ? 0 : -1}
          className="el-view__option"
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

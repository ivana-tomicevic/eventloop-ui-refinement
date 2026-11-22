"use client";
import { useEffect, useState, type CSSProperties } from "react";

const PIECES = 28;
const TONES = ["ink", "hot", "pop"] as const; // --color-brand, --color-hot, --cat-sports-accent

/**
 * A short confetti burst (1.5 s at most) for the welcome after onboarding. Pure CSS animation,
 * never blocks clicks (pointer-events: none), and skipped when the user prefers reduced motion.
 * Styles: app/onboarding.css (.el-confetti).
 */
export default function Confetti() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 1500);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="el-confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => (
        <span
          key={i}
          className={`el-confetti__piece el-confetti__piece--${TONES[i % TONES.length]}`}
          // Spread across the width with a little variety in delay, drift and spin
          style={
            {
              "--x": `${(i * 37) % 100}%`,
              "--delay": `${(i % 7) * 40}ms`,
              "--drift": `${((i * 53) % 120) - 60}px`,
              "--spin": `${(i % 2 ? 1 : -1) * (180 + ((i * 29) % 360))}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

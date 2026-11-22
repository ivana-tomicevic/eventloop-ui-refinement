/** Helpers for the old onboarding routes (/welcome, /onboarding, /onboarding/done) that now redirect. */
import { safeNext } from "./auth";

export type LegacyParams = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** "?next=/path" with the same safety check as everywhere else ("" when there is none). */
export function legacyQuery(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  return value ? `?${new URLSearchParams({ next: safeNext(value) })}` : "";
}

/** Host profiles (organizer onboarding) and event ownership, per account. */
import type { EventRecord } from "./event-data";
import { currentUserId } from "./auth";

export type HostProfile = { name: string; area: string; about?: string };

const PROFILES_KEY = "eventloop-host-profiles"; // { [accountId]: HostProfile }

/** Owner of the 10 demo events. Nobody signs in as this account. */
export const DEMO_HOST = "demo-host";

/** "My events" = events this account created. Demo events belong to the demo host. */
export const isMine = (e: EventRecord) =>
  Boolean(e.ownerId) && e.ownerId === currentUserId();

function readProfiles(): Record<string, HostProfile> {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

/** The signed-in account's host profile, if it has one. */
export function readHostProfile(id = currentUserId()): HostProfile | null {
  const p = id ? readProfiles()[id] : undefined;
  return p && typeof p.name === "string" && p.name.trim()
    ? { name: p.name, area: String(p.area || ""), about: p.about || "" }
    : null;
}
export function saveHostProfile(p: HostProfile) {
  const id = currentUserId();
  if (!id) return;
  try {
    localStorage.setItem(
      PROFILES_KEY,
      JSON.stringify({ ...readProfiles(), [id]: p }),
    );
  } catch {}
}

/** "Switch to hosting": the host setup until a profile exists, then the workspace. */
export const hostLanding = () =>
  readHostProfile() ? "/organizer" : "/organizer/setup";

/** "Hosted by …" on event details: the owner's host profile name. */
export function hostName(e: EventRecord) {
  return e.ownerId ? readHostProfile(e.ownerId)?.name || null : null;
}

/**
 * Demo accounts (no backend, no real sign-in). Browsing never needs an account; saving an event
 * and getting tickets do. Those actions send people to /auth and bring them back afterwards.
 *
 * Every account keeps its own `onboardingDone` and `lastRole` (localStorage), so two people
 * using the same browser don't share them.
 * Until onboardingDone: sign up -> /all-set ("Welcome to Eventloop.")
 *                       sign up with ?host=1 -> /organizer/setup -> /all-set?as=host
 */
import { getSavedIds, toggleSaved } from "./event-data";

type Role = "organizer" | null;
type Account = {
  name: string; // "" for Google/Apple demo accounts
  provider?: Provider;
  onboardingDone: boolean;
  lastRole: Role;
};

const ACCOUNTS_KEY = "eventloop-demo-accounts"; // { [email]: Account }
const CURRENT_KEY = "eventloop-demo-current"; // email of the signed-in account
const USER_KEY = "eventloop-demo-user"; // display name for the header
const ROLE_KEY = "eventloop-demo-role"; // "organizer" while hosting
const PENDING_SAVE_KEY = "eventloop-pending-save";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
};
const readAccounts = (): Record<string, Account> => {
  try {
    const a = JSON.parse(read(ACCOUNTS_KEY) || "{}");
    return a && typeof a === "object" ? a : {};
  } catch {
    return {};
  }
};
const writeAccount = (email: string, account: Account) =>
  write(ACCOUNTS_KEY, JSON.stringify({ ...readAccounts(), [email]: account }));
const normal = (email: string) => email.trim().toLowerCase();

/** Email of the signed-in account ("" when signed out). Used as the owner id of events. */
export const currentUserId = () => {
  const email = read(CURRENT_KEY) || "";
  return email && readAccounts()[email] ? email : "";
};
const currentAccount = () => readAccounts()[currentUserId()] || null;

export const isSignedIn = () => Boolean(currentUserId());
export const userName = () => (isSignedIn() ? read(USER_KEY) || "" : "");
/** Full name of the account for tickets; Google/Apple demo accounts use their display name. */
export const accountName = () =>
  (currentAccount()?.name || "").trim() || userName();
/** First name given at sign up ("" for Google/Apple demo accounts). */
export const firstName = () =>
  (currentAccount()?.name || "").trim().split(/\s+/)[0] || "";
export const isHosting = () => isSignedIn() && read(ROLE_KEY) === "organizer";
export const isOnboarded = () => Boolean(currentAccount()?.onboardingDone);
export function markOnboarded() {
  const id = currentUserId();
  const account = readAccounts()[id];
  if (account) writeAccount(id, { ...account, onboardingDone: true });
}

/** Only same-site paths are allowed as a return address. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** After a booking button ("Get tickets" / "Save your spot") -> sign up -> onboarding, go back to the event they were looking at. */
export function eventToReturnTo(next: string) {
  const checkout = next.match(/^\/checkout\?event=([^&]+)/);
  if (checkout) return `/events/${checkout[1]}`;
  return /^\/events\/[^/]+$/.test(next) ? next : null;
}

export function authUrl(
  next: string,
  opts: { mode?: "login" | "signup"; host?: boolean } = {},
) {
  const q = new URLSearchParams({ next: safeNext(next) });
  if (opts.mode) q.set("mode", opts.mode);
  if (opts.host) q.set("host", "1");
  return `/auth?${q}`;
}
const here = () => window.location.pathname + window.location.search;

/** Sends a signed-out visitor to /auth (coming back to `next`). Returns true when already signed in. */
export function requireAccount(next = here()) {
  if (isSignedIn()) return true;
  window.location.assign(authUrl(next));
  return false;
}

/** The heart: toggles when signed in; otherwise remembers the event and saves it right after sign-in. */
export function saveOrAskToSignIn(id: string | number): string[] | null {
  if (isSignedIn()) return toggleSaved(id);
  write(PENDING_SAVE_KEY, String(id));
  window.location.assign(authUrl(here()));
  return null;
}

export type Provider = "google" | "apple";
const PROVIDER_NAMES: Record<Provider, string> = {
  google: "Google user",
  apple: "Apple user",
};
export const providerEmail = (p: Provider) => `demo-${p}@eventloop.app`;

export type AuthResult =
  { ok: true; go: string } | { ok: false; error: "exists" | "unknown" };

/**
 * Sign up, log in or "Continue with Google/Apple" (demo). Email sign up refuses an email that
 * already has an account; email log in refuses an unknown one. Google/Apple sign in or up.
 */
export function authenticate({
  mode,
  email,
  name,
  provider,
  host,
  next,
}: {
  mode: "login" | "signup" | "provider";
  email: string;
  name?: string;
  provider?: Provider;
  host: boolean;
  next: string;
}): AuthResult {
  const id = normal(email);
  const existing = readAccounts()[id];
  if (mode === "signup" && existing) return { ok: false, error: "exists" };
  if (mode === "login" && !existing) return { ok: false, error: "unknown" };

  const account: Account = existing || {
    name: provider ? "" : (name || "").trim(),
    provider,
    onboardingDone: false,
    lastRole: null,
  };
  writeAccount(id, account);
  write(CURRENT_KEY, id);
  const display =
    account.name.split(/\s+/)[0] ||
    (provider ? PROVIDER_NAMES[provider] : id.split("@")[0]);
  write(USER_KEY, display);

  const pending = read(PENDING_SAVE_KEY);
  if (pending) {
    if (!getSavedIds().includes(pending)) toggleSaved(pending);
    write(PENDING_SAVE_KEY, null);
  }

  const target = safeNext(next);
  // Not onboarded yet (new or never finished): the welcome flow, every time.
  // Everyone signs up as a visitor; ?host=1 ("Sign up as a host") sets up the host profile first.
  if (!account.onboardingDone) {
    if (host) {
      write(ROLE_KEY, "organizer");
      return { ok: true, go: "/organizer/setup" };
    }
    write(ROLE_KEY, null);
    return {
      ok: true,
      go: `/all-set?${new URLSearchParams({ next: target })}`,
    };
  }
  if (host) {
    write(ROLE_KEY, "organizer");
    return { ok: true, go: "/organizer" };
  }
  // Back to the role this account had when it logged out.
  if (account.lastRole === "organizer" && target === "/") {
    write(ROLE_KEY, "organizer");
    return { ok: true, go: "/organizer" };
  }
  write(ROLE_KEY, null);
  return { ok: true, go: target };
}

/** "Host events" / "Switch to hosting": the same account becomes an organizer. */
export function startHosting() {
  write(ROLE_KEY, "organizer");
}
/** "Switch to exploring": back to the attendee side. */
export function stopHosting() {
  write(ROLE_KEY, null);
}

export function signOut() {
  const id = currentUserId();
  const account = readAccounts()[id];
  // Remember this account's role for its next log in.
  if (account)
    writeAccount(id, {
      ...account,
      lastRole: read(ROLE_KEY) === "organizer" ? "organizer" : null,
    });
  write(CURRENT_KEY, null);
  write(USER_KEY, null);
  write(ROLE_KEY, null);
}

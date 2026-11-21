"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, LogOut } from "lucide-react";

const links = [
  { href: "/", label: "Explore" },
  { href: "/saved", label: "Saved" },
  { href: "/my-tickets", label: "Tickets" },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

/**
 * Shared header (docs/explore-reference.html .nav).
 * `showSearch={false}` on Explore: the page has its own search pill, so the header one would duplicate it.
 */
export default function SiteNav({
  showSearch = true,
}: {
  showSearch?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState("");
  const [query, setQuery] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const role = localStorage.getItem("eventloop-demo-role");
    if (role === "organizer") {
      window.location.replace("/organizer");
      return;
    }
    setUser(localStorage.getItem("eventloop-demo-user") || "");
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, []);

  // Account menu: close on click outside and on Escape (focus goes back to the avatar).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const logout = () => {
    localStorage.removeItem("eventloop-demo-user");
    localStorage.removeItem("eventloop-demo-role");
    setUser("");
    setOpen(false);
    window.location.assign("/auth");
  };
  const search = (value: string) => {
    setQuery(value);
    if (location.pathname === "/" || location.pathname === "/saved") {
      window.dispatchEvent(
        new CustomEvent("eventloop-search", { detail: value }),
      );
    }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      window.location.assign("/?q=" + encodeURIComponent(query));
    } else {
      window.dispatchEvent(
        new CustomEvent("eventloop-search", { detail: query }),
      );
    }
  };

  return (
    <header className="el-nav">
      <a className="el-nav__logo" href="/">
        <span className="el-nav__mark" aria-hidden="true">
          e
        </span>
        <span className="el-nav__wordmark">eventloop</span>
      </a>
      <nav className="el-nav__links" aria-label="Main">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={
                "el-nav__link" + (active ? " el-nav__link--active" : "")
              }
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
      {showSearch && (
        <form className="el-nav-search" role="search" onSubmit={submit}>
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search events, places or organizers"
            placeholder="Search events, places or organizers..."
            value={query}
            onChange={(e) => search(e.target.value)}
          />
        </form>
      )}
      <span className="el-nav__spacer" />
      {user ? (
        <div className="el-nav__account" ref={accountRef}>
          <button
            ref={buttonRef}
            className="el-nav__avatar-button"
            type="button"
            aria-expanded={open}
            aria-controls="account-menu"
            aria-label={`Account menu for ${user}`}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="el-nav__avatar" aria-hidden="true">
              {initials(user)}
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {open && (
            <div className="el-nav__menu" id="account-menu">
              <a href="/my-tickets" onClick={() => setOpen(false)}>
                My Tickets
              </a>
              <a href="/onboarding" onClick={() => setOpen(false)}>
                My interests
              </a>
              <button type="button" onClick={logout}>
                <LogOut size={15} aria-hidden="true" /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <a className="el-nav__join" href="/auth">
          Join
        </a>
      )}
    </header>
  );
}

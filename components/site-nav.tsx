"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import AccountMenu, { type MenuItem } from "./account-menu";
import { authUrl, signOut, startHosting, userName } from "./auth";
import { readHostProfile } from "./host";
import VibesModal, { openVibes } from "./vibes-modal";

const links = [
  { href: "/", label: "Explore" },
  { href: "/saved", label: "Saved" },
  { href: "/my-tickets", label: "Tickets" },
];

/**
 * Shared attendee header (docs/explore-reference.html .nav).
 * Signed out: "Log in" + ink "Sign up". Signed in (any role): the account menu with "Log out".
 * No host profile yet: a quiet "Become a host" link next to the avatar (hidden on narrow phones);
 * with one, the menu has "Switch to hosting" instead. "My vibes" opens a modal on any page.
 * `showSearch` keeps the old header search available; every screen now passes false.
 */
export default function SiteNav({
  showSearch = true,
}: {
  showSearch?: boolean;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState("");
  const [hasHostProfile, setHasHostProfile] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setUser(userName());
    setHasHostProfile(Boolean(readHostProfile()));
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, []);

  const here = () =>
    typeof window === "undefined" ? "/" : location.pathname + location.search;
  // Browsing works without an account, so logging out just reloads the attendee side.
  const logout = () => {
    signOut();
    window.location.assign("/");
  };
  // "Switch to hosting" (only shown once a host profile exists): the organizer workspace.
  const switchToHosting = (e: React.MouseEvent) => {
    e.preventDefault();
    startHosting();
    window.location.assign("/organizer");
  };
  const goToAuth = (mode: "login" | "signup") => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.assign(authUrl(here(), { mode }));
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

  const menu: MenuItem[] = [
    { label: "My vibes", onClick: openVibes },
    ...(hasHostProfile
      ? [
          { label: "Host profile", href: "/organizer/setup?edit=1" },
          {
            label: "Switch to hosting",
            href: "/organizer",
            onClick: switchToHosting,
          },
        ]
      : []),
    {
      label: "Log out",
      onClick: logout,
      icon: <LogOut size={15} aria-hidden="true" />,
    },
  ];

  return (
    <header className={"el-nav" + (user ? "" : " el-nav--guest")}>
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
                "el-nav__link" +
                (active ? " el-nav__link--active" : "") +
                (link.href === "/" ? "" : " el-nav__link--member")
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
            autoComplete="off"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
        </form>
      )}
      <span className="el-nav__spacer" />
      {user ? (
        <>
          {!hasHostProfile && (
            <a className="el-nav__link el-nav__become" href="/organizer/setup">
              Become a host
            </a>
          )}
          <AccountMenu name={user} items={menu} />
          <VibesModal />
        </>
      ) : (
        <>
          <a
            className="el-nav__link"
            href="/auth?mode=login"
            onClick={goToAuth("login")}
          >
            Log in
          </a>
          <a
            className="el-nav__join"
            href="/auth?mode=signup"
            onClick={goToAuth("signup")}
          >
            Sign up
          </a>
        </>
      )}
    </header>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import AccountMenu from "./account-menu";
import {
  authUrl,
  isHosting,
  isSignedIn,
  signOut,
  stopHosting,
  userName,
} from "./auth";
import { readHostProfile } from "./host";

/**
 * Organizer header: logo, "My events", account menu. Same look as the attendee header
 * (.el-nav in app/explore-header.css). "Create an event" lives on the My events page.
 * Only for people who chose to host: others go to log in or back to Explore.
 */
export default function OrganizerNav() {
  const pathname = usePathname();
  const [name, setName] = useState("");
  useEffect(() => {
    if (!isSignedIn()) {
      window.location.replace(
        authUrl(location.pathname + location.search, { host: true }),
      );
      return;
    }
    if (!isHosting()) {
      window.location.replace("/");
      return;
    }
    setName(readHostProfile()?.name || userName() || "Host");
  }, []);
  const active = pathname === "/organizer" || pathname === "/organizer/events";
  return (
    <header className="el-nav">
      <a className="el-nav__logo" href="/organizer">
        <span className="el-nav__mark" aria-hidden="true">
          e
        </span>
        <span className="el-nav__wordmark">eventloop</span>
        <span className="sr-only"> organizer</span>
      </a>
      <nav className="el-nav__links" aria-label="Organizer">
        <a
          href="/organizer"
          className={"el-nav__link" + (active ? " el-nav__link--active" : "")}
          aria-current={active ? "page" : undefined}
        >
          My events
        </a>
      </nav>
      <span className="el-nav__spacer" />
      {name && (
        <AccountMenu
          name={name}
          items={[
            { label: "Host profile", href: "/organizer/setup?edit=1" },
            {
              label: "Switch to exploring",
              href: "/",
              onClick: (e) => {
                e.preventDefault();
                stopHosting();
                window.location.assign("/");
              },
            },
            {
              label: "Log out",
              icon: <LogOut size={15} aria-hidden="true" />,
              onClick: () => {
                signOut();
                window.location.assign("/");
              },
            },
          ]}
        />
      )}
    </header>
  );
}

import type { ReactNode } from "react";

/**
 * Shared frame: one white card centred on the page. By default a small logo sits top left
 * (auth, host profile, welcome); `header` replaces it with a real header (the booking steps).
 * Styles: app/onboarding.css (.el-shell).
 */
export default function OnboardingShell({
  labelledBy,
  className = "",
  header,
  decor,
  children,
}: {
  labelledBy?: string;
  className?: string;
  header?: ReactNode;
  /** Decorative layer behind the card (the welcome photos); the card stays on top. */
  decor?: ReactNode;
  children?: ReactNode;
}) {
  const card = children && (
    <section
      className={"el-shell__card " + className}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
  return (
    <main className={"el-shell" + (header ? " el-shell--header" : "")}>
      {header ?? (
        <a className="el-nav__logo el-shell__logo" href="/">
          <span className="el-nav__mark" aria-hidden="true">
            e
          </span>
          <span className="el-nav__wordmark">eventloop</span>
        </a>
      )}
      {decor ? (
        <div className="el-shell__stage">
          {decor}
          {card}
        </div>
      ) : (
        card
      )}
    </main>
  );
}

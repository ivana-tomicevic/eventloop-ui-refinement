import OrganizerNav from "@/components/organizer-nav";

/** Any organizer URL that isn't built yet (e.g. /organizer/analytics). */
export default function OrganizerPlaceholder() {
  return (
    <main className="event-details-page">
      <OrganizerNav />
      <div className="el-org">
        <div className="el-empty">
          <h2>Not built yet.</h2>
          <p>This part of the organizer space is coming soon.</p>
          <a className="el-empty__cta" href="/organizer/events">
            Back to my events
          </a>
        </div>
      </div>
    </main>
  );
}

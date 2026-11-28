import { BookingEmpty } from "@/components/booking";

/** Any address that does not exist (for example /booking). Same empty-state card as "Event not found". */
export default function NotFound() {
  return (
    <BookingEmpty
      title="Page not found"
      text="That link is off the map. Plenty more is on."
      href="/"
      label="Back to Explore"
    />
  );
}

# EventLoop UI and demo-flow repair

This package is based on the exact `eventloop-ui-refinement-main(2).zip` upload. It is a complete project folder, not a patch intended to be layered on a different version.

## Changes
- Shared attendee navbar with Explore, Saved, My Tickets, profile menu, Switch account and Sign out (demo local state).
- Explore: balanced three-line headline, compact AI label (not “AI preview”), aligned eight-column category grid, colored Lucide icons, consistent event cards and heart bookmarks.
- Local demo event images and common event-data helpers used by Explore, details and booking summaries. Organizer-uploaded cover images are stored in browser localStorage for this prototype (1.5 MB max).
- Event details: dynamic route content, event photo, save button, clear ticket CTA and Google Maps search link for the event's location. A real embedded map/API is not configured.
- Checkout: event ID carried across steps; credit-card expiry automatically formats as MM/YY; demo payment records a session confirmation before moving to success; confirmation and My Tickets show the event.
- Organizer: shared sidebar across Dashboard, My Events and Create Event; event publish redirects to My Events; date display handles saved event `start`; cover-image file selection added; spacing improved.
- Auth and onboarding: Lucide role/interest icons, Google multicolor mark, Apple silhouette, white social buttons. OAuth remains a demo, not connected.

## Important limitations
- The checkout ticket-price model is still the original three demo ticket tiers (general/VIP/student), **not** a payment integration or a dynamic per-event ticket engine. No real payments occur.
- Demo account state is stored locally and is not secure authentication.
- Saved events and organizer events use localStorage, while demo booking confirmation uses sessionStorage. No cross-device or server synchronization exists.
- Event images are locally bundled illustrative crops and are not photographs of real scheduled events. Replace them with licensed real event photographs before publishing.
- Google Maps opens an external location search. Exact pin placement needs verified venue coordinates or an API.
- A full Next.js build was **not** run because dependencies were not installed in this environment. TSX files passed a TypeScript syntax transpilation check, but you should run `npm.cmd install` (if needed) and `npm.cmd run build` on your machine.

## Suggested local QA
1. Run `npm.cmd run dev`; inspect Explore on desktop and mobile.
2. Open each of four demo event cards, bookmark one and check `/saved`.
3. Complete demo checkout for a selected event, entering a dummy card number only; verify MM/YY auto slash, success and My Tickets. Never enter real card data into a demo.
4. Open `/auth`, select attendee/organizer, check sign-in and sign-out menus.
5. Organizer > Create Event: upload a small cover, set date and venue, publish, confirm redirect to My Events, and open event from Explore.
6. Run `npm.cmd run build` and report any compiler or browser console errors.

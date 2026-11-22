# Eventloop

Web app for discovering small local events (by interest, mood, AI-style search). Demo/portfolio project. No backend: everything is demo state in localStorage/sessionStorage. Do not add real auth, payments or a backend unless explicitly asked.

## Stack
- Next.js (app router), React 19, TypeScript (strict), Tailwind 4, shadcn/ui, lucide-react
- Package manager: npm (use `npm install`, `npm run dev`, `npm run build`). The user is on Windows.

## Structure
- `app/` routes and global CSS (`explore.css`, `eventloop-polish.css`, `details.css`, ...)
- `components/eventloop-screen.tsx` Explore screen (search, category grid, event cards)
- `components/event-data.ts` event type, demo events, helpers (`eventDate`, `eventPrice`, `eventLocation`, saved events)
- Other screens: event details, checkout/payment, booking success, auth, onboarding, organizer dashboard / my events / create event

## Rules for working here
- Work in small, separate tasks. One task = one logical change. Explain in 2-3 sentences what you changed and which files.
- Before finishing a task, run `npm run build` and fix errors you introduced.
- Do not rewrite or reorganize files that are not part of the task.
- Pilot city is Madrid; the target audience is students. All app text is in ENGLISH, no exceptions (UI, placeholders, empty states, demo data).
- Demo events are in Madrid: made-up venue names, real neighbourhoods (Malasaña, Lavapiés, La Latina, Chueca, Retiro, Chamberí). Prices in euros (€), "Free" for free events. Times in 24h format. Do not show distance in km.
- Copy tone: lively, cool, assertive and inviting. Short sentences, address the user directly, no corporate phrasing. Examples: "Tonight in Madrid", "What's your vibe?", "Pick of the night", "Quiet night. Tomorrow is packed."
- Visual direction: warm near-white background (not grey), pure white cards, near-black text, one purple brand accent, one warm coral accent used only for urgency. No gradients on buttons. Text contrast at least 4.5:1.
- Display font (Bricolage Grotesque, --font-display) samo za naslov zaglavlja Explorea; sve ostalo Inter.
- Zaglavlje bez vibea: kremasta kartica (--tint-any-bg) s dva reda: naslov + 'Don't stay in.' u sivom. Lime samo za čipove uskoro/počelo (unutar 60 min) i Now liniju.
- Price is the strongest element on a card (bold, tabular numbers).
- All styles (colors, radii, fonts) go through tokens defined in one place, never hard-coded per component.
- Match the existing visual style (colors, radii, spacing in the CSS files). Reuse existing classes and components before adding new ones.
- Accessibility basics: real buttons/links, aria-labels on icon buttons, visible focus states.
- Never commit or push; the user reviews the diff and commits herself.

## Target design (agreed)
- Explore: heading "Šta ti se radi večeras?", ONE search field that can take natural language, time toggle (Večeras / Sutra / Vikend), chips (Besplatno, Blizu mene), mood tiles, one featured event card, then a fixed 3-column grid.
- Cards: category as plain text (not a clipped chip), unified date format (e.g. "Danas · 20:00"), price left and distance right, no shared/duplicate images.
- Still missing: empty states, error states, organizer dashboard filled with real content, mobile polish.

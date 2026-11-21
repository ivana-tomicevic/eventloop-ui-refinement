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
- Keep existing UI language (Bosnian copy, KM prices) unless told to change it.
- Match the existing visual style (colors, radii, spacing in the CSS files). Reuse existing classes and components before adding new ones.
- Accessibility basics: real buttons/links, aria-labels on icon buttons, visible focus states.
- Never commit or push; the user reviews the diff and commits herself.

## Target design (agreed)
- Explore: heading "Šta ti se radi večeras?", ONE search field that can take natural language, time toggle (Večeras / Sutra / Vikend), chips (Besplatno, Blizu mene), mood tiles, one featured event card, then a fixed 3-column grid.
- Cards: category as plain text (not a clipped chip), unified date format (e.g. "Danas · 20:00"), price left and distance right, no shared/duplicate images.
- Still missing: empty states, error states, organizer dashboard filled with real content, mobile polish.

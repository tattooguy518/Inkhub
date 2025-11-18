# Tattoo Studio Hub – v5 PWA

This is a mobile-first PWA for your tattoo studio:

- Home:
  - Next upcoming session
  - Auto follow-ups (1 week & 1 month after sessions)
  - Message generator for client check-ins
  - Tasks with checkboxes
  - 4-piece flash idea generator + pin to inspo
  - Quick income/expense capture
  - Simple focus timer

- Booking:
  - Create / edit / delete sessions
  - Monthly calendar view with highlighted days
  - “Google Calendar” button opens pre-filled event

- Clients:
  - Auto-built from sessions
  - Groups, search, detail view
  - Last session + total spend
  - Notes about them & sessions

- Inspo:
  - Idea paths with name, tier, idea text
  - Generator per tier
  - Search + filter + edit/delete
  - Pinned flash sheets from Home appear here

- Social:
  - Plan posts (platform, date, concept, caption, hashtags, notes)
  - Caption & hashtag suggestions
  - Planned posts list
  - Social calendar with color hints
  - Social content idea generator + pin list

- Finance:
  - Income log (searchable)
  - Expense log (searchable)

All data stays in `localStorage` on the device/browser.

To run locally:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` and “Install / Add to Home screen”.

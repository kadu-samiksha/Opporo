# Oppora

> Your career journey, one step at a time.

Oppora is a personal internship and job application tracker for college students and job seekers. It keeps applications, deadlines, tasks, interview preparation and job-search analytics in one place. It runs entirely in the browser: no backend, no login, no paid APIs.

## Who it is for

Students and early-career job seekers who apply to many roles at once and lose track of where each one stands. Oppora answers questions like:

- Which applications are still open, and what is the next step for each?
- What is due this week?
- How am I preparing for each interview?
- How many applications turn into interviews and offers?

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 18 (JavaScript, no TypeScript) |
| Build tool | Vite |
| Routing | React Router v6 |
| Icons | Lucide React |
| Charts | Recharts |
| Styling | Plain CSS with CSS variables (light default, optional dark) |
| Storage | `localStorage` |
| Tests | Vitest |

## Getting started

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm test          # run unit tests
```

## Features

### Overview
- Greeting, and stat cards: total applications, in progress, interviews scheduled, offers received.
- Charts: applications added per week, status breakdown (donut), funnel (applied, assessment, interview, offer).
- Upcoming interviews and deadlines, pending follow-ups, recent activity, pipeline summary.
- First-time empty state with an option to load demo data.

### My Applications
- Create, edit and delete applications (deletion asks for confirmation and also removes linked tasks and prep records).
- Search, filter by status, role type, work mode and priority, and sort by date added, deadline, company or status.
- Pagination (10 per page), CSV export of the filtered list, and a table that turns into stacked cards on mobile.
- Add/edit form grouped into Role, Dates and source, and Documents and contact, with validation.

### Application Board
- Kanban columns: Interested, Preparing, Applied, Assessment, Interview, Offer.
- Drag and drop between columns, or use the "Move to" menu on each card (keyboard friendly).
- Moving a card updates the real application status and persists it.
- Rejected and withdrawn applications are hidden by default and shown with a toggle.

### Calendar
- Month view of interviews, application deadlines, assessments, follow-ups and tasks, each with its own colour.
- Day detail panel and an upcoming list that flags overdue items.
- Tasks and follow-ups: create, edit, complete and delete, linked to an application, with pending, overdue, completed and all filters.

### Interview Preparation
- One record per interview, linked to an application, with date, round and type.
- Checklist by category (DSA, Java, JavaScript and React, SQL, CS fundamentals, Aptitude, Behavioral and HR) with a progress bar.
- Your own questions and answers, notes, outcome, feedback and next steps.
- No generated or sample answers are shown. Everything is what you enter.

### Analytics
- Submitted per month, added per week, status distribution, applications by source.
- Interview rate and offer rate, with a date-range filter (all time, 30 days, 90 days).

### Settings
- Display name, light or dark theme, in-app reminder toggle.
- Resume versions with links, cover letter links, portfolio and GitHub URLs.
- CSV export, remove demo data, and clear all data (with confirmation).

## Project structure

```
oppora/
├── index.html                 # HTML entry, loads Inter font
├── package.json               # scripts and dependencies
├── vite.config.js             # Vite + React plugin, Vitest config
├── .gitignore
├── README.md
└── src/
    ├── main.jsx               # React root, router and store providers
    ├── App.jsx                # route table, applies theme
    ├── context/
    │   └── store.jsx          # app state, reducer, localStorage load/save, demo data
    ├── utils/
    │   ├── helpers.js         # constants, dates, validation, metrics, CSV, calendar events
    │   └── helpers.test.js    # unit tests for CSV, metrics, validation
    ├── components/
    │   ├── Layout.jsx         # sidebar, top bar, search, notifications, modal host
    │   ├── AppModal.jsx       # add/edit application form
    │   ├── charts.jsx         # Recharts wrappers (bars, trend, donut)
    │   └── ui.jsx             # Badge, Avatar, Priority, Field, Empty, Confirm
    ├── pages/
    │   ├── Overview.jsx
    │   ├── Applications.jsx
    │   ├── Board.jsx
    │   ├── Calendar.jsx       # calendar and tasks
    │   ├── Prep.jsx           # interview preparation
    │   ├── Analytics.jsx
    │   └── Settings.jsx       # profile, resumes, data controls
    └── styles/
        └── app.css            # design tokens, layout, components, responsive rules
```

### How the pieces fit together

- **State** lives in one reducer in `context/store.jsx`. Pages read it with `useStore()` and change it through helpers such as `saveApp`, `save`, `remove`, `setSettings`, `loadDemo`, `removeDemo` and `clearAll`.
- **Persistence**: every state change is written to `localStorage`. On load, stored data is validated, and anything malformed is ignored instead of crashing the app.
- **Modal**: `Layout` owns the add/edit modal and exposes `useUI().openApp(app?)` so any page can open it.
- **Calendar events** are derived from real records by `buildEvents`: unsent application deadlines, prep interview dates, and tasks. Nothing is stored twice.
- **Pure logic** (validation, metrics, CSV, dates) is in `utils/helpers.js` so it can be unit tested without React.

## Data model

All data is stored under the `localStorage` key `oppora:v1`.

```text
{
  apps:    [{ id, company, title, type, status, priority, location, mode, source,
              dateAdded, submitted, deadline, salary, url, resume, coverLetter,
              recruiter, recruiterEmail, notes, peak, updatedAt, demo? }],
  tasks:   [{ id, title, due, kind, priority, appId, notes, done, demo? }],
  prep:    [{ id, appId, date, round, type, checklist[], questions[], notes,
              outcome, feedback, next, demo? }],
  resumes: [{ id, name, version, link, coverLetter, notes }],
  settings:{ name, theme, remind, portfolio, github }
}
```

- `peak` is the furthest pipeline stage an application ever reached. It lets a rejection after an interview still count as an interview.
- Records created from demo data carry `demo: true`, show a "Demo" label, and can be removed in one click from Settings.

### Statuses

Interested, Preparing to Apply, Applied, Assessment, Interview Scheduled, Interview Completed, Offer Received, Rejected, Withdrawn.

## How the metrics are calculated

- **Submitted** = applications whose furthest stage is Applied or later.
- **Interview rate** = submitted applications that reached an interview stage / submitted.
- **Offer rate** = submitted applications that reached Offer Received / submitted.
- With zero submitted applications, rates show `-` instead of dividing by zero.
- The date-range filter on Analytics filters by the date an application was added.

## CSV export

Exports the applications you see (filtered list) or all applications (from Settings). Commas, quotes and line breaks are escaped correctly, a UTF-8 BOM is included so Excel opens it properly, and cells that start with `=`, `+` or `@` are prefixed with `'` to avoid spreadsheet formula injection.

## Accessibility and responsiveness

- Labelled form fields, visible focus states, keyboard-reachable controls, and dialogs closable with Esc.
- Status is always shown as text, not colour alone.
- Layout works on desktop, tablet and mobile: sidebar becomes a drawer, tables become cards, forms collapse to one column.
- Motion is removed for users who prefer reduced motion.

## Privacy

Data never leaves your browser. Clearing browser site data deletes it. Export a CSV regularly as a backup.

## Limitations

- Data is stored in one browser on one device. There is no sync, login or import.
- Reminders only appear while Oppora is open. No email or push notifications are sent.
- The calendar has a month view only.
- Tests cover utility functions only, not components.

## Roadmap ideas

- Week view and drag-to-reschedule on the calendar
- CSV/JSON import and full backup restore
- Optional backend with authentication and sync
- Browser notifications through a service worker
- Component and end-to-end tests

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npm test` and `npm run build` before opening a pull request.
3. Keep logic in `utils/` and presentation in `components/` and `pages/`.

## License

Add a license of your choice (for example MIT) before publishing.

# Oppora

*Your career journey, one step at a time.*

Oppora is a personal internship and job application tracker. It runs entirely in the browser with no backend, no login and no paid APIs.

## Run it

```bash
npm install
npm run dev     # development server
npm run build   # production build
npm test        # unit tests for CSV, metrics and validation
```

## Features

- **Overview**: stats, weekly activity, status donut, funnel, upcoming items, follow-ups, pipeline summary, empty state with optional demo data.
- **My Applications**: add, edit, delete (with confirmation), search, filter (status, type, work mode, priority), sort, pagination, CSV export. Table becomes cards on mobile.
- **Application Board**: drag cards between columns (or use the "Move to" menu for keyboard access). Rejected and withdrawn are shown through a toggle.
- **Calendar**: month view of interviews, deadlines, assessments, follow-ups and tasks; upcoming list with overdue items; task create, edit, complete and delete.
- **Interview Preparation**: per-interview records with checklist by category, your own questions and answers, notes, outcome, feedback, next steps and progress bar.
- **Analytics**: submitted per month, added per week, status mix, sources, interview and offer rates, date-range filter.
- **Settings**: name, theme, in-app reminders, resume versions and links, CSV export, remove demo data, clear all data.

## Data and metrics

Everything is saved to `localStorage` under the key `oppora:v1`. Malformed stored data is ignored safely. Interview and offer rates use *submitted applications* (reached Applied or later) as the denominator, and credit is kept after a later rejection. With zero submissions rates show "-".

## Limitations

- Data lives in one browser on one device. Export CSV for backups.
- Reminders show only while the app is open. No email or push notifications are sent.
- The calendar has a month view only (no week view).
- CSV export is one-way; there is no import.
- Tests cover utilities (`src/utils/helpers.test.js`); there are no component tests.
- This code has not been run through `npm install` and `npm run build` yet, so run those first and fix any small issues.

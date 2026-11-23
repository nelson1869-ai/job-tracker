# Job Tracker

A small app for keeping track of job applications: company, role, link, where you found it, status, dates, and notes.

- **Private by design:** everything is saved in your browser (localStorage). There is no server or account.
- **Auto fill:** paste a job-post link and "Found on" is filled in (LinkedIn, Indeed, JobStreet, Kalibrr, OnlineJobs.ph).
- **Dashboard:** totals per status, a pipeline bar with response rate, recent applications, and what needs attention (follow-ups due, interviews this week).
- **Three ways to see your list:** a table on desktop, cards on phones, and a Kanban board where "Move to" changes a stage.
- **Search, status filter, and sorting** (newest, company, date applied, follow-up date).
- **Details for each job:** salary, workplace, employment type, recruiter, interview date and time, resume version, next action, and notes.
- **Friendly safety nets:** field-level form errors, accessible confirm dialogs, toasts, and Undo after deleting.
- **Dark mode** that remembers your choice.
- **Export / import** a JSON backup (version 2; version 1 backups still import).

Built with Next.js 16 (static export), React 19, TypeScript, Tailwind CSS 4, and Vitest.
The [`/learn`](src/app/learn/page.tsx) page explains how it works, with links to the official docs.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit tests (Vitest)
pnpm lint && pnpm typecheck
pnpm build        # static files in out/
```

## Code map

| File | What it does |
| --- | --- |
| `src/features/jobs/types.ts` | The shape of an application, statuses, and sources |
| `src/features/jobs/storage.ts` | Reads and saves the list in localStorage |
| `src/features/jobs/use-applications.ts` | Hook: list + add, update, delete, replace |
| `src/features/jobs/application-form.tsx` | The form (FormData) with link-based auto fill |
| `src/features/jobs/detect-source.ts` | Which job board a link belongs to |
| `src/features/jobs/filters.ts` | Counts, filter, search, and due follow-ups |
| `src/features/jobs/backup.ts` | Create and safely read backup files |
| `src/features/jobs/validation.ts` | One place that cleans stored/imported data and checks form input |
| `src/features/jobs/dashboard.tsx` | Metrics, pipeline, recent applications, needs attention |
| `src/features/jobs/application-list.tsx` | Table (desktop) and cards (phones) |
| `src/features/jobs/kanban-board.tsx` | Board view with "Move to" |
| `src/features/ui/` | Modal, confirm dialog, and toasts (native `<dialog>`, no library) |

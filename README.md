# Job Tracker

A small app for keeping track of job applications: company, role, link, where you found it, status, dates, and notes.

- **Private by design:** everything is saved in your browser (localStorage). There is no server or account.
- **Auto fill:** paste a job-post link and "Found on" is filled in (LinkedIn, Indeed, JobStreet, Kalibrr, OnlineJobs.ph).
- **Filter, search, and follow-up reminders** for applications that need a follow-up today or earlier.
- **Export / import** a JSON backup, so you can move your data or keep a copy.

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

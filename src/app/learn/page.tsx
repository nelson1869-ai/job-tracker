import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn — Job Tracker",
  description: "What this small app teaches: localStorage, useSyncExternalStore, forms, filtering, backups, and tests.",
};

// Each lesson: what it is, where it lives in the code, and the official docs to study.
const lessons = [
  {
    title: "1. Keep data in the browser with localStorage",
    body: "There is no server or database. Applications are saved as JSON text in localStorage, so they stay after a reload but only on this browser.",
    file: "src/features/jobs/storage.ts",
    docs: [{ label: "MDN: localStorage", href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" }],
  },
  {
    title: "2. Read outside data in React with useSyncExternalStore",
    body: "localStorage lives outside React. useSyncExternalStore reads it safely: the server renders an empty list, the browser shows the saved list, and there is no hydration error.",
    file: "src/features/jobs/use-applications.ts",
    docs: [{ label: "React: useSyncExternalStore", href: "https://react.dev/reference/react/useSyncExternalStore" }],
  },
  {
    title: "3. Read a whole form with FormData",
    body: "Instead of one state variable per field, the form reads every field at once when it is submitted. Only 'Found on' is kept in state, so pasting a link can change it.",
    file: "src/features/jobs/application-form.tsx",
    docs: [
      { label: "MDN: FormData", href: "https://developer.mozilla.org/en-US/docs/Web/API/FormData" },
      { label: "React: controlled select", href: "https://react.dev/reference/react-dom/components/select" },
    ],
  },
  {
    title: "4. Match a link's website safely",
    body: "new URL(link).hostname gives the website name. Checking hostname.endsWith('.indeed.com') is safe; checking link.includes('indeed') can be fooled by look-alike sites.",
    file: "src/features/jobs/detect-source.ts",
    docs: [{ label: "MDN: URL()", href: "https://developer.mozilla.org/en-US/docs/Web/API/URL/URL" }],
  },
  {
    title: "5. Calculate, don't store, what you can derive",
    body: "Counts, the filtered list, and due follow-ups are calculated from the list on every render. Keeping them in separate state would let them get out of sync.",
    file: "src/features/jobs/filters.ts",
    docs: [{ label: "React: avoid redundant state", href: "https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state" }],
  },
  {
    title: "6. Never trust an imported file",
    body: "A backup file can come from anywhere, so every field is checked. Unknown statuses fall back to 'Applied' and bad dates are dropped before anything is saved.",
    file: "src/features/jobs/backup.ts",
    docs: [
      { label: "MDN: Blob (making a file to download)", href: "https://developer.mozilla.org/en-US/docs/Web/API/Blob" },
      { label: "OWASP: input validation", href: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html" },
    ],
  },
  {
    title: "7. Test the logic with Vitest",
    body: "The pure functions (no React) are easy to test. Each test file sits next to the code it tests. Run them with pnpm test.",
    file: "src/features/jobs/*.test.ts",
    docs: [{ label: "Vitest: getting started", href: "https://vitest.dev/guide/" }],
  },
  {
    title: "8. Ship it as a static site",
    body: "output: 'export' turns the app into plain HTML, CSS, and JS files that any static host can serve. Partial prerendering (PPR) does not work in export mode, so it is turned off.",
    file: "next.config.ts",
    docs: [{ label: "Next.js: static exports", href: "https://nextjs.org/docs/app/guides/static-exports" }],
  },
];

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        ← Back to the tracker
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">What this app teaches</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Eight small lessons from building the Job Tracker, each with the file to read and the official docs.
      </p>

      <ol className="mt-8 space-y-6">
        {lessons.map((lesson) => (
          <li key={lesson.title} className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-semibold">{lesson.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{lesson.body}</p>
            <p className="mt-3 font-mono text-xs text-zinc-500">{lesson.file}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {lesson.docs.map((doc) => (
                <li key={doc.href}>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {doc.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}

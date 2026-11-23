import Link from "next/link";
import { JobTracker } from "@/features/jobs/job-tracker";
import { ThemeToggle } from "@/features/theme/theme-toggle";

// The page itself is a Server Component (static HTML).
// Only the interactive parts run in the browser: <JobTracker /> reads localStorage,
// and <ThemeToggle /> changes the theme.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Job Tracker</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Every application in one place. Your data stays in this browser only.
          </p>
          <Link href="/learn" className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            How this app is built →
          </Link>
        </div>
        <ThemeToggle />
      </header>
      <JobTracker />
    </main>
  );
}

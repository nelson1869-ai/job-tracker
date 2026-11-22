import { JobTracker } from "@/features/jobs/job-tracker";

// The page itself is a Server Component (static HTML).
// Only <JobTracker /> runs in the browser, because it reads localStorage.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Keep track of every job you apply to. Your data stays in this browser only.
        </p>
      </header>
      <JobTracker />
    </main>
  );
}

"use client";

import { STATUSES } from "./types";
import type { StatusFilter as Filter } from "./filters";

interface StatusFilterProps {
  value: Filter;
  counts: Record<Filter, number>;
  onChange: (value: Filter) => void;
}

const OPTIONS: Filter[] = ["All", ...STATUSES];

// A row of buttons: All (5), Saved (1), Applied (3), …
// aria-pressed tells screen readers which one is selected.
export function StatusFilter({ value, counts, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={
              selected
                ? "rounded-full bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }
          >
            {option} <span className="opacity-75">{counts[option]}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
  actionLabel?: string; // e.g. "Undo"
  onAction?: () => void;
}

type NewToast = Omit<Toast, "id">;

// Small hook that owns the list of toasts. Each toast disappears after a few
// seconds (longer when it has an action like Undo, so there is time to click it).
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (toast: NewToast) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { ...toast, id }]); // keep at most 3
      timers.current.set(id, setTimeout(() => dismiss(id), toast.onAction ? 8000 : 4000));
    },
    [dismiss],
  );

  // Clear any pending timers if the page goes away.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  return { toasts, notify, dismiss };
}

// The visible stack. aria-live="polite" makes screen readers read each new toast.
export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.tone === "error"
              ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"
              : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          {toast.actionLabel && toast.onAction ? (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onDismiss(toast.id);
              }}
              className="rounded-md px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              {toast.actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
            className="rounded-md px-1.5 text-lg leading-none text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}
    </div>
  );
}

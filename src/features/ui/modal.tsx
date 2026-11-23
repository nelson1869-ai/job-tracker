"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

// A modal built on the browser's own <dialog> element. showModal() gives us,
// for free: a backdrop, focus kept inside the dialog, and Escape to close.
// Docs: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
export function Modal({ open, title, onClose, children, wide = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Keep the real <dialog> in sync with the `open` prop.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose} // fires for Escape and for dialog.close()
      onClick={(event) => {
        // A click on the dark backdrop (outside the panel) closes the dialog.
        if (event.target === event.currentTarget) onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-md"} rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}

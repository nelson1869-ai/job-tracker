"use client";

import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean; // red button for actions that remove data
  onConfirm: () => void;
  onCancel: () => void;
}

// Replaces the browser's confirm(): same question, but styled, keyboard-friendly,
// and readable by screen readers.
export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          autoFocus // the safe choice gets focus first
          className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`h-10 rounded-lg px-4 text-sm font-semibold text-white ${
            danger ? "bg-rose-700 hover:bg-rose-800" : "bg-emerald-700 hover:bg-emerald-800"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

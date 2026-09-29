"use client";

import {useEffect, useRef, type FormEvent, type ReactNode} from "react";

type FormModalShellProps = {
  isOpen: boolean;
  eyebrow: string;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Modal formularza: nagłówek i stopka (przyciski) zawsze widoczne,
 * przewija się tylko treść pól — wygodniej na telefonie.
 */
const FormModalShell = ({
  isOpen,
  eyebrow,
  title,
  onClose,
  onSubmit,
  children,
  footer,
}: FormModalShellProps) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    bodyRef.current?.scrollTo({top: 0});
  }, [isOpen, title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--mt-ink)]/40 px-0 backdrop-blur-sm sm:items-center sm:px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden border border-[var(--mt-line)] bg-white shadow-sm sm:max-h-[90vh]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--mt-line)] px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              {eyebrow}
            </p>
            <h2
              id="form-modal-title"
              className="font-display mt-1 text-2xl tracking-tight"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl leading-none text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)]"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div
            ref={bodyRef}
            className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-4 sm:px-7 sm:py-5"
          >
            {children}
          </div>

          <div className="shrink-0 border-t border-[var(--mt-line)] bg-white px-5 py-4 sm:px-7">
            {footer}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModalShell;

"use client";

import ModalPortal from "@/components/ModalPortal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = "Usuń",
  cancelLabel = "Anuluj",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-signal)]">
              Potwierdzenie
            </p>
            <h2
              id="confirm-modal-title"
              className="font-display mt-1 text-2xl tracking-tight"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-2xl leading-none text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)] disabled:opacity-50"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--mt-muted)]">
          {description}
        </p>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-[var(--mt-line)] px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-ink)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-[var(--mt-signal)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7c2a0e] disabled:opacity-50"
          >
            {isLoading ? "Usuwanie…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ConfirmModal;

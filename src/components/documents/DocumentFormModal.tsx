"use client";

import {useEffect, useState} from "react";

import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {
  DOCUMENT_FORM_TYPES,
  DOCUMENT_TYPE_LABELS,
  normalizeDocumentType,
  type DocumentFormType,
  type DocumentType,
} from "@/lib/documentTypes";

export type DocumentFormValues = {
  _id: string;
  name: string;
  type: DocumentType;
  documentNumber: string;
  issuer: string;
  issuedAt: string | null;
  expiresAt: string;
  notes: string;
  daysUntilExpiry?: number;
  isOverdue?: boolean;
  isUrgent?: boolean;
};

type DocumentFormModalProps = {
  isOpen: boolean;
  item?: DocumentFormValues | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const DocumentFormModal = ({
  isOpen,
  item = null,
  onClose,
  onSaved,
}: DocumentFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [type, setType] = useState<DocumentFormType>("identity");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setName(item.name);
      setType(normalizeDocumentType(item.type));
      setDocumentNumber(item.documentNumber || "");
      setIssuer(item.issuer || "");
      setIssuedAt(toDateInputValue(item.issuedAt) || "");
      setExpiresAt(toDateInputValue(item.expiresAt) || "");
      setNotes(item.notes || "");
    } else {
      setName("");
      setType("identity");
      setDocumentNumber("");
      setIssuer("");
      setIssuedAt("");
      setExpiresAt("");
      setNotes("");
    }

    setError("");
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        type,
        documentNumber,
        issuer,
        issuedAt: issuedAt || null,
        expiresAt,
        notes,
      };

      const response = await fetch(
        isEditing ? `/api/documents/${item!._id}` : "/api/documents",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message ||
            (isEditing
              ? "Nie udało się zaktualizować dokumentu"
              : "Nie udało się dodać dokumentu")
        );
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Nie udało się zaktualizować dokumentu."
            : "Nie udało się dodać dokumentu."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Dokumenty osobiste
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj dokument" : "Dodaj dokument"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)]"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Kategoria
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentFormType)}
              className={fieldClass}
            >
              {DOCUMENT_FORM_TYPES.map((value) => (
                <option key={value} value={value}>
                  {DOCUMENT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Nazwa
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Np. Dowód osobisty / paszport"
              required
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Numer
              </label>
              <input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Opcjonalnie"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Wydany przez
              </label>
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Np. urząd / instytucja"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Data wydania
              </label>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Ważny do
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Gdzie jest kopia, uwagi do wymiany…"
              className={`${fieldClass} resize-y`}
            />
          </div>

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 border border-[var(--mt-line)] px-4 py-3.5 text-sm font-semibold text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
            >
              {isSaving
                ? "Zapisywanie…"
                : isEditing
                  ? "Zapisz zmiany"
                  : "Dodaj dokument"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;

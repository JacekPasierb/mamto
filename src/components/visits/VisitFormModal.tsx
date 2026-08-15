"use client";

import {useEffect, useState} from "react";

import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {addMonths} from "@/lib/visitHelpers";
import {
  VISIT_DEFAULT_INTERVAL_MONTHS,
  VISIT_FORM_TYPES,
  VISIT_NAME_SUGGESTIONS,
  VISIT_TYPE_HINTS,
  VISIT_TYPE_LABELS,
  normalizeVisitType,
  type VisitFormType,
  type VisitType,
} from "@/lib/visitTypes";

export type VisitFormValues = {
  _id: string;
  name: string;
  type: VisitType;
  providerName: string;
  lastVisitAt: string | null;
  nextDueAt: string;
  intervalMonths: number | null;
  notes: string;
  daysUntilDue?: number;
  isOverdue?: boolean;
  isUrgent?: boolean;
};

type VisitFormModalProps = {
  isOpen: boolean;
  item?: VisitFormValues | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const VisitFormModal = ({
  isOpen,
  item = null,
  onClose,
  onSaved,
}: VisitFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [type, setType] = useState<VisitFormType>("health");
  const [providerName, setProviderName] = useState("");
  const [lastVisitAt, setLastVisitAt] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [intervalMonths, setIntervalMonths] = useState("12");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setName(item.name);
      setType(normalizeVisitType(item.type));
      setProviderName(item.providerName || "");
      setLastVisitAt(toDateInputValue(item.lastVisitAt) || "");
      setNextDueAt(toDateInputValue(item.nextDueAt) || "");
      setIntervalMonths(
        item.intervalMonths == null
          ? String(
              VISIT_DEFAULT_INTERVAL_MONTHS[normalizeVisitType(item.type)] || 6
            )
          : String(item.intervalMonths)
      );
      setNotes(item.notes || "");
    } else {
      const defaultType: VisitFormType = "health";
      const months = VISIT_DEFAULT_INTERVAL_MONTHS[defaultType];
      setName("");
      setType(defaultType);
      setProviderName("");
      setLastVisitAt("");
      setNextDueAt(toDateInputValue(addMonths(new Date(), months)));
      setIntervalMonths(String(months));
      setNotes("");
    }

    setError("");
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleTypeChange = (next: VisitFormType) => {
    setType(next);
    const months = VISIT_DEFAULT_INTERVAL_MONTHS[next];
    setIntervalMonths(String(months));

    if (!isEditing) {
      if (!name.trim() || VISIT_NAME_SUGGESTIONS[type].includes(name)) {
        setName(VISIT_NAME_SUGGESTIONS[next][0] || "");
      }

      const base = lastVisitAt || toDateInputValue(new Date());
      setNextDueAt(toDateInputValue(addMonths(base, months)));
    }
  };

  const handleIntervalBlur = () => {
    const months = Number(intervalMonths);
    if (!Number.isFinite(months) || months <= 0) return;
    if (isEditing && nextDueAt) return;

    const base = lastVisitAt || toDateInputValue(new Date());
    setNextDueAt(toDateInputValue(addMonths(base, months)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        type,
        providerName,
        lastVisitAt: lastVisitAt || null,
        nextDueAt,
        intervalMonths: intervalMonths || null,
        notes,
      };

      const response = await fetch(
        isEditing ? `/api/visits/${item!._id}` : "/api/visits",
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
              ? "Nie udało się zaktualizować wizyty"
              : "Nie udało się dodać wizyty")
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
            ? "Nie udało się zaktualizować wizyty."
            : "Nie udało się dodać wizyty."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  const suggestions = VISIT_NAME_SUGGESTIONS[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Wizyty
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj wizytę" : "Dodaj wizytę"}
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
              onChange={(e) =>
                handleTypeChange(e.target.value as VisitFormType)
              }
              className={fieldClass}
            >
              {VISIT_FORM_TYPES.map((value) => (
                <option key={value} value={value}>
                  {VISIT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--mt-muted)]">
              {VISIT_TYPE_HINTS[type]}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Rodzaj wizyty
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => {
                const isSelected = name === suggestion;

                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setName(suggestion)}
                    className={`border px-3 py-1.5 text-sm transition ${
                      isSelected
                        ? "border-[var(--mt-accent)] bg-[var(--mt-accent-soft)] text-[var(--mt-ink)]"
                        : "border-[var(--mt-line)] text-[var(--mt-muted)] hover:border-[var(--mt-ink)] hover:text-[var(--mt-ink)]"
                    }`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lub wpisz własną nazwę"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Specjalista / salon
            </label>
            <input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Opcjonalnie"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Ostatnia wizyta
              </label>
              <input
                type="date"
                value={lastVisitAt}
                onChange={(e) => setLastVisitAt(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Co ile miesięcy
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value)}
                onBlur={handleIntervalBlur}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Następny termin
            </label>
            <input
              type="date"
              value={nextDueAt}
              onChange={(e) => setNextDueAt(e.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Adres, zalecenia, uwagi…"
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
                  : "Dodaj wizytę"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitFormModal;

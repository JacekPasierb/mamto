"use client";

import {useEffect, useState} from "react";

import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {addMonths} from "@/lib/petHelpers";
import {
  PET_CARE_DEFAULT_INTERVAL_MONTHS,
  PET_CARE_FORM_TYPES,
  PET_CARE_NAME_SUGGESTIONS,
  PET_CARE_TYPE_HINTS,
  PET_CARE_TYPE_LABELS,
  normalizePetCareType,
  type PetCareFormType,
  type PetCareType,
} from "@/lib/petTypes";

export type PetCareFormValues = {
  _id: string;
  name: string;
  type: PetCareType;
  providerName: string;
  lastDoneAt: string | null;
  nextDueAt: string;
  intervalMonths: number | null;
  notes: string;
  daysUntilDue?: number;
  isOverdue?: boolean;
  isUrgent?: boolean;
};

type PetCareFormModalProps = {
  isOpen: boolean;
  petId: string;
  item?: PetCareFormValues | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const PetCareFormModal = ({
  isOpen,
  petId,
  item = null,
  onClose,
  onSaved,
}: PetCareFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [type, setType] = useState<PetCareFormType>("rabies");
  const [providerName, setProviderName] = useState("");
  const [lastDoneAt, setLastDoneAt] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [intervalMonths, setIntervalMonths] = useState("12");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const computeNextDue = (doneAt: string, monthsStr: string) => {
    const months = Number(monthsStr);
    if (!Number.isFinite(months) || months <= 0) return null;
    const base = doneAt || toDateInputValue(new Date());
    return toDateInputValue(addMonths(base, months));
  };

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setName(item.name);
      setType(normalizePetCareType(item.type));
      setProviderName(item.providerName || "");
      setLastDoneAt(toDateInputValue(item.lastDoneAt) || "");
      setNextDueAt(toDateInputValue(item.nextDueAt) || "");
      setIntervalMonths(
        item.intervalMonths == null
          ? String(
              PET_CARE_DEFAULT_INTERVAL_MONTHS[normalizePetCareType(item.type)]
            )
          : String(item.intervalMonths)
      );
      setNotes(item.notes || "");
    } else {
      const defaultType: PetCareFormType = "rabies";
      const months = PET_CARE_DEFAULT_INTERVAL_MONTHS[defaultType];
      setName(PET_CARE_NAME_SUGGESTIONS[defaultType][0] || "");
      setType(defaultType);
      setProviderName("");
      setLastDoneAt("");
      setNextDueAt(toDateInputValue(addMonths(new Date(), months)));
      setIntervalMonths(String(months));
      setNotes("");
    }

    setError("");
  }, [isOpen, item]);

  if (!isOpen) return null;

  const applyNextDue = (doneAt: string, monthsStr: string) => {
    const next = computeNextDue(doneAt, monthsStr);
    if (next) setNextDueAt(next);
  };

  const handleTypeChange = (next: PetCareFormType) => {
    setType(next);
    const months = PET_CARE_DEFAULT_INTERVAL_MONTHS[next];
    setIntervalMonths(String(months));

    if (!name.trim() || PET_CARE_NAME_SUGGESTIONS[type].includes(name)) {
      setName(PET_CARE_NAME_SUGGESTIONS[next][0] || "");
    }

    applyNextDue(lastDoneAt, String(months));
  };

  const handleLastDoneChange = (value: string) => {
    setLastDoneAt(value);
    applyNextDue(value, intervalMonths);
  };

  const handleIntervalChange = (value: string) => {
    setIntervalMonths(value);
    applyNextDue(lastDoneAt, value);
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
        lastDoneAt: lastDoneAt || null,
        nextDueAt,
        intervalMonths: intervalMonths || null,
        notes,
      };

      const response = await fetch(
        isEditing
          ? `/api/pets/${petId}/care/${item!._id}`
          : `/api/pets/${petId}/care`,
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
              ? "Nie udało się zaktualizować zabiegu"
              : "Nie udało się dodać zabiegu")
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
            ? "Nie udało się zaktualizować zabiegu."
            : "Nie udało się dodać zabiegu."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  const suggestions = PET_CARE_NAME_SUGGESTIONS[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Opieka
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj zabieg" : "Dodaj zabieg"}
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
              Typ
            </label>
            <select
              value={type}
              onChange={(e) =>
                handleTypeChange(e.target.value as PetCareFormType)
              }
              className={fieldClass}
            >
              {PET_CARE_FORM_TYPES.map((value) => (
                <option key={value} value={value}>
                  {PET_CARE_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--mt-muted)]">
              {PET_CARE_TYPE_HINTS[type]}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Nazwa
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={fieldClass}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className="border border-[var(--mt-line)] px-2.5 py-1 text-xs text-[var(--mt-muted)] transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-ink)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Wet / preparat
            </label>
            <input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Klinika lub nazwa preparatu"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Ostatnio wykonane
              </label>
              <input
                type="date"
                value={lastDoneAt}
                onChange={(e) => handleLastDoneChange(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Interwał (mies.)
              </label>
              <input
                type="number"
                min="1"
                value={intervalMonths}
                onChange={(e) => handleIntervalChange(e.target.value)}
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
            <p className="mt-2 text-xs text-[var(--mt-muted)]">
              Liczony z daty zabiegu + interwału — możesz poprawić ręcznie.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={fieldClass}
            />
          </div>

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--mt-line)] px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-ink)]"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
            >
              {isSaving ? "Zapisuję…" : isEditing ? "Zapisz" : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetCareFormModal;

"use client";

import {useEffect, useState} from "react";
import {
  STOCK_CATEGORIES,
  STOCK_CATEGORY_LABELS,
  STOCK_UNITS,
  type StockCategory,
  type StockUnit,
} from "@/lib/stockTypes";

export type StockItemFormValues = {
  _id: string;
  name: string;
  category: StockCategory;
  quantity: number;
  unit: StockUnit;
  minQuantity: number;
  expiresAt: string | null;
  notes: string;
};

type StockFormModalProps = {
  isOpen: boolean;
  item?: StockItemFormValues | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const toDateInput = (value: string | null | undefined) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const StockFormModal = ({
  isOpen,
  item = null,
  onClose,
  onSaved,
}: StockFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockCategory>("medicine");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<StockUnit>("szt.");
  const [minQuantity, setMinQuantity] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(String(item.quantity));
      setUnit(item.unit);
      setMinQuantity(String(item.minQuantity));
      setExpiresAt(toDateInput(item.expiresAt));
      setNotes(item.notes || "");
    } else {
      setName("");
      setCategory("medicine");
      setQuantity("1");
      setUnit("szt.");
      setMinQuantity("1");
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
        category,
        quantity,
        unit,
        minQuantity,
        expiresAt: expiresAt || null,
        notes,
      };

      const response = await fetch(
        isEditing ? `/api/stock/${item!._id}` : "/api/stock",
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
              ? "Nie udało się zaktualizować zapasu"
              : "Nie udało się dodać zapasu")
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
            ? "Nie udało się zaktualizować zapasu."
            : "Nie udało się dodać zapasu."
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
              Zapasy
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj zapas" : "Dodaj zapas"}
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
              Nazwa
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Np. Magnez B6"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Kategoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StockCategory)}
              className={fieldClass}
            >
              {STOCK_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {STOCK_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Ilość
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            <div className="col-span-1">
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Jednostka
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as StockUnit)}
                className={fieldClass}
              >
                {STOCK_UNITS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Min.
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Data ważności
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
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
              placeholder="Dawkowanie, gdzie trzymasz, uwagi…"
              className={`${fieldClass} resize-y`}
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {isSaving
              ? "Zapisywanie…"
              : isEditing
                ? "Zapisz zmiany"
                : "Dodaj zapas"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockFormModal;

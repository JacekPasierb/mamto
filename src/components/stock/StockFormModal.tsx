"use client";

import {useEffect, useState} from "react";
import {
  STOCK_CATEGORIES,
  STOCK_CATEGORY_LABELS,
  STOCK_UNITS,
  type StockCategory,
  type StockUnit,
  type UsageMode,
} from "@/lib/stockTypes";
import {toDateInputValue} from "@/lib/calculateCurrentStock";

export type StockItemFormValues = {
  _id: string;
  name: string;
  category: StockCategory;
  usageMode: UsageMode;
  stock?: number;
  stockDate?: string | null;
  dailyUsage?: number;
  reminderThreshold?: number;
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

const todayInput = () => toDateInputValue(new Date());

const isDailyItem = (item: StockItemFormValues) =>
  item.usageMode === "daily" ||
  (item.stock != null &&
    item.stockDate != null &&
    item.dailyUsage != null &&
    Number(item.dailyUsage) > 0);

const StockFormModal = ({
  isOpen,
  item = null,
  onClose,
  onSaved,
}: StockFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockCategory>("medicine");
  const [isDailyMedicine, setIsDailyMedicine] = useState(true);
  const [stock, setStock] = useState("30");
  const [stockDate, setStockDate] = useState(todayInput());
  const [dailyUsage, setDailyUsage] = useState("1");
  const [reminderThreshold, setReminderThreshold] = useState("4");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<StockUnit>("tabletek");
  const [minQuantity, setMinQuantity] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      const daily = isDailyItem(item);

      setName(item.name);
      setCategory(item.category);
      setIsDailyMedicine(daily);

      if (daily) {
        setStock(String(item.stock ?? 0));
        setStockDate(toDateInputValue(item.stockDate) || todayInput());
        setDailyUsage(String(item.dailyUsage ?? 1));
        setReminderThreshold(String(item.reminderThreshold ?? 1));
        setUnit(item.unit || "tabletek");
      } else {
        setQuantity(String(item.quantity));
        setUnit(item.unit);
        setMinQuantity(String(item.minQuantity));
        setExpiresAt(toDateInputValue(item.expiresAt));
      }

      setNotes(item.notes || "");
    } else {
      setName("");
      setCategory("medicine");
      setIsDailyMedicine(true);
      setStock("30");
      setStockDate(todayInput());
      setDailyUsage("1");
      setReminderThreshold("4");
      setQuantity("1");
      setUnit("tabletek");
      setMinQuantity("1");
      setExpiresAt("");
      setNotes("");
    }

    setError("");
  }, [isOpen, item]);

  if (!isOpen) return null;

  const showDailyFields = category === "medicine" && isDailyMedicine;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = showDailyFields
        ? {
            name,
            category,
            usageMode: "daily",
            stock,
            stockDate,
            dailyUsage,
            reminderThreshold,
            unit: "tabletek",
            notes,
          }
        : {
            name,
            category,
            usageMode: "static",
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
              placeholder="Np. Valsacor"
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

          {category === "medicine" ? (
            <label className="flex items-center gap-3 text-sm text-[var(--mt-muted)]">
              <input
                type="checkbox"
                checked={isDailyMedicine}
                onChange={(e) => setIsDailyMedicine(e.target.checked)}
                className="h-4 w-4 accent-[var(--mt-accent)]"
              />
              Przyjmowany codziennie (stan wyliczany z daty)
            </label>
          ) : null}

          {showDailyFields ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                    Stan początkowy
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                    Data stanu
                  </label>
                  <input
                    type="date"
                    value={stockDate}
                    onChange={(e) => setStockDate(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                    Zużycie dzienne
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={dailyUsage}
                    onChange={(e) => setDailyUsage(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                    Próg przypomnienia
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={reminderThreshold}
                    onChange={(e) => setReminderThreshold(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

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
                  : "Dodaj zapas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockFormModal;

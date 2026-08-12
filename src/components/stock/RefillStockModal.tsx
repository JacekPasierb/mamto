"use client";

import {useEffect, useState} from "react";

import type {UsageMode} from "@/lib/stockTypes";

type RefillStockModalProps = {
  isOpen: boolean;
  itemName: string;
  itemId: string;
  usageMode: UsageMode;
  unit: string;
  currentStock?: number;
  onClose: () => void;
  onRefilled: (updatedItem: Record<string, unknown>) => void;
};

const RefillStockModal = ({
  isOpen,
  itemName,
  itemId,
  usageMode,
  unit,
  currentStock,
  onClose,
  onRefilled,
}: RefillStockModalProps) => {
  const [stock, setStock] = useState("30");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isDaily = usageMode === "daily";

  useEffect(() => {
    if (!isOpen) return;

    setStock(
      currentStock != null && currentStock > 0
        ? String(currentStock)
        : isDaily
          ? "30"
          : "1"
    );
    setError("");
  }, [isOpen, currentStock, isDaily]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/api/stock/${itemId}/refill`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({stock}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Nie udało się uzupełnić zapasu");
      }

      const updated = await response.json();

      onRefilled(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się uzupełnić zapasu."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Uzupełnienie
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              Uzupełnij zapas
            </h2>
            <p className="mt-2 text-sm text-[var(--mt-muted)]">{itemName}</p>
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
              Nowy stan ({unit})
            </label>
            <input
              type="number"
              min="0"
              step={isDaily ? "1" : "0.01"}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className={fieldClass}
            />
            <p className="mt-2 text-xs text-[var(--mt-muted)]">
              {isDaily
                ? "Data stanu zostanie ustawiona na dziś."
                : "Zastąpi aktualną ilość na stanie."}
            </p>
          </div>

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {isSaving ? "Zapisywanie…" : "Zapisz uzupełnienie"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RefillStockModal;

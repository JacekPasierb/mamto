"use client";

import {useCallback, useEffect, useMemo, useState} from "react";

import AppShell from "@/components/dashboard/AppShell";
import {
  STOCK_CATEGORIES,
  STOCK_CATEGORY_LABELS,
  type StockCategory,
  type StockUnit,
} from "@/lib/stockTypes";
import StockFormModal, {type StockItemFormValues} from "./StockFormModal";

type StockItem = StockItemFormValues & {
  category: StockCategory;
  unit: StockUnit;
};

type StockTab = "all" | "low" | StockCategory;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const isLow = (item: StockItem) => item.quantity <= item.minQuantity;

const isExpiringSoon = (item: StockItem) => {
  if (!item.expiresAt) return false;

  const expires = new Date(item.expiresAt);
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  return expires <= in30Days;
};

const StockPage = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StockTab>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const response = await fetch("/api/stock");

    if (!response.ok) {
      throw new Error("Nie udało się pobrać zapasów");
    }

    const data = await response.json();
    setItems(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await loadItems();
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadItems]);

  const counts = useMemo(() => {
    const result: Record<StockTab, number> = {
      all: items.length,
      low: items.filter(isLow).length,
      medicine: 0,
      supplements: 0,
      lenses: 0,
      household: 0,
      other: 0,
    };

    for (const item of items) {
      result[item.category] += 1;
    }

    return result;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    if (activeTab === "low") return items.filter(isLow);
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const tabs: {id: StockTab; label: string}[] = [
    {id: "all", label: "Wszystko"},
    {id: "low", label: "Kończące się"},
    ...STOCK_CATEGORIES.map((category) => ({
      id: category as StockTab,
      label: STOCK_CATEGORY_LABELS[category],
    })),
  ];

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (item: StockItem) => {
    const confirmed = window.confirm(
      `Usunąć „${item.name}”? Tej operacji nie da się cofnąć.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      const response = await fetch(`/api/stock/${item._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć zapasu");
      }

      await loadItems();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć zapasu.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[var(--mt-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
              Moduł 05
            </p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">Zapasy</h1>
            <p className="mt-3 max-w-lg text-[var(--mt-muted)]">
              Leki, soczewki i rzeczy, których nie może zabraknąć — zanim
              skończą się w najmniej oczekiwanym momencie.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj zapas
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filtr zapasów"
          className="mt-8 flex gap-1 overflow-x-auto border-b border-[var(--mt-line)] pb-px"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 px-3 py-3 text-sm transition sm:px-4 ${
                  isActive
                    ? "font-medium text-[var(--mt-ink)]"
                    : "text-[var(--mt-muted)] hover:text-[var(--mt-ink)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 tabular-nums ${
                    isActive
                      ? tab.id === "low"
                        ? "text-[var(--mt-signal)]"
                        : "text-[var(--mt-accent)]"
                      : "text-[var(--mt-muted)]/70"
                  }`}
                >
                  {counts[tab.id]}
                </span>
                {isActive ? (
                  <span
                    className="absolute inset-x-0 bottom-0 h-[2px]"
                    style={{
                      background:
                        tab.id === "low"
                          ? "var(--mt-signal)"
                          : "var(--mt-accent)",
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="mt-10 text-[var(--mt-muted)]">Ładowanie zapasów…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-[var(--mt-muted)]">
              Nie masz jeszcze żadnych zapasów.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-[var(--mt-muted)]">
              Brak pozycji w tej kategorii.
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--mt-line)] border-b border-[var(--mt-line)]">
            {filteredItems.map((item) => {
              const low = isLow(item);
              const expiring = isExpiringSoon(item);

              return (
                <li key={item._id} className="py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-accent)]">
                          {STOCK_CATEGORY_LABELS[item.category]}
                        </p>
                        {low ? (
                          <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--mt-signal)]">
                            Kończy się
                          </span>
                        ) : null}
                        {expiring ? (
                          <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--mt-signal)]">
                            Ważność
                          </span>
                        ) : null}
                      </div>

                      <h2 className="font-display mt-2 text-2xl tracking-tight">
                        {item.name}
                      </h2>

                      <p className="mt-2 text-sm text-[var(--mt-muted)]">
                        Stan:{" "}
                        <span
                          className={`font-medium tabular-nums ${
                            low
                              ? "text-[var(--mt-signal)]"
                              : "text-[var(--mt-ink)]"
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-[var(--mt-muted)]">
                          {" "}
                          · próg {item.minQuantity} {item.unit}
                        </span>
                      </p>

                      {item.expiresAt ? (
                        <p className="mt-2 text-sm text-[var(--mt-ink)]">
                          Ważne do: {formatDate(item.expiresAt)}
                        </p>
                      ) : null}

                      {item.notes ? (
                        <p className="mt-2 text-sm text-[var(--mt-muted)]">
                          {item.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-4 self-start">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
                      >
                        Edytuj
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item._id}
                        className="text-sm font-medium text-[var(--mt-signal)] underline-offset-4 transition hover:underline disabled:opacity-50"
                      >
                        {deletingId === item._id ? "Usuwanie…" : "Usuń"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <StockFormModal
        isOpen={isModalOpen}
        item={editingItem}
        onClose={closeModal}
        onSaved={loadItems}
      />
    </AppShell>
  );
};

export default StockPage;

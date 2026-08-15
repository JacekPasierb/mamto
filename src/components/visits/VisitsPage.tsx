"use client";

import {useCallback, useEffect, useMemo, useState} from "react";

import AppShell from "@/components/dashboard/AppShell";
import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {
  VISIT_FORM_TYPES,
  VISIT_TYPE_LABELS,
  normalizeVisitType,
  type VisitFormType,
  type VisitType,
} from "@/lib/visitTypes";
import VisitFormModal, {type VisitFormValues} from "./VisitFormModal";

type VisitItem = VisitFormValues;

type VisitTab = "all" | "urgent" | VisitFormType;

const formatDate = (value: string) => {
  const [year, month, day] = toDateInputValue(value).split("-").map(Number);

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const formatDaysLeft = (days: number) => {
  if (days < 0) {
    return `po terminie o ${Math.abs(days)} dni`;
  }

  if (days === 0) {
    return "dziś";
  }

  return `za ${days} dni`;
};

const formatInterval = (months: number | null | undefined) => {
  if (!months) return null;
  if (months === 1) return "co miesiąc";
  if (months < 5) return `co ${months} miesiące`;
  return `co ${months} miesięcy`;
};

const ITEMS_PER_PAGE = 8;

const VisitsPage = () => {
  const [items, setItems] = useState<VisitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VisitTab>("all");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisitItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const response = await fetch("/api/visits", {cache: "no-store"});

    if (!response.ok) {
      throw new Error("Nie udało się pobrać wizyt");
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
    const result: Record<VisitTab, number> = {
      all: items.length,
      urgent: items.filter((item) => item.isUrgent).length,
      health: 0,
      dental: 0,
      beauty: 0,
      hair: 0,
      other: 0,
    };

    for (const item of items) {
      result[normalizeVisitType(item.type)] += 1;
    }

    return result;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    if (activeTab === "urgent") return items.filter((item) => item.isUrgent);
    return items.filter(
      (item) => normalizeVisitType(item.type) === activeTab
    );
  }, [items, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleTabChange = (tab: VisitTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabs: {id: VisitTab; label: string}[] = [
    {id: "all", label: "Wszystko"},
    {id: "urgent", label: "Kończące się"},
    ...VISIT_FORM_TYPES.map((type) => ({
      id: type as VisitTab,
      label: VISIT_TYPE_LABELS[type],
    })),
  ];

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: VisitItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleComplete = async (item: VisitItem) => {
    const confirmed = window.confirm(
      `Oznaczyć „${item.name}” jako odbytą? Ustawimy kolejny termin według interwału.`
    );

    if (!confirmed) return;

    try {
      setCompletingId(item._id);

      const response = await fetch(`/api/visits/${item._id}/complete`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Nie udało się oznaczyć wizyty");
      }

      await loadItems();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się oznaczyć wizyty.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (item: VisitItem) => {
    const confirmed = window.confirm(
      `Usunąć wizytę „${item.name}”? Tej operacji nie da się cofnąć.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      const response = await fetch(`/api/visits/${item._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć wizyty");
      }

      await loadItems();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć wizyty.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[var(--mt-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Wizyty</h1>
            <p className="mt-3 max-w-lg text-[var(--mt-muted)]">
              Lekarze, stomatolodzy, fryzjer, paznokcie i inne systematyczne
              wizyty — zanim wypadną z głowy.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj wizytę
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filtr wizyt"
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
                onClick={() => handleTabChange(tab.id)}
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
                      ? tab.id === "urgent"
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
                        tab.id === "urgent"
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
          <p className="mt-10 text-[var(--mt-muted)]">Ładowanie wizyt…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-[var(--mt-muted)]">
              Nie masz jeszcze żadnych wizyt. Dodaj dentystę, ginekologa,
              fryzjera albo paznokcie.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-[var(--mt-muted)]">Brak wizyt w tej kategorii.</p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--mt-line)] border-b border-[var(--mt-line)]">
            {paginatedItems.map((item) => (
              <li key={item._id} className="py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-accent)]">
                        {VISIT_TYPE_LABELS[normalizeVisitType(item.type)]}
                      </p>
                      {item.isOverdue ? (
                        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--mt-signal)]">
                          Po terminie
                        </span>
                      ) : item.isUrgent ? (
                        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--mt-signal)]">
                          Wkrótce
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-display mt-2 text-2xl tracking-tight">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--mt-muted)]">
                      Następna: {formatDate(item.nextDueAt)}
                      {item.daysUntilDue != null
                        ? ` · ${formatDaysLeft(item.daysUntilDue)}`
                        : ""}
                    </p>

                    {item.providerName ? (
                      <p className="mt-1 text-sm text-[var(--mt-muted)]">
                        {item.providerName}
                      </p>
                    ) : null}

                    {item.lastVisitAt ? (
                      <p className="mt-1 text-sm text-[var(--mt-muted)]">
                        Ostatnia: {formatDate(item.lastVisitAt)}
                      </p>
                    ) : null}

                    {formatInterval(item.intervalMonths) ? (
                      <p className="mt-1 text-sm text-[var(--mt-ink)]">
                        Cykl: {formatInterval(item.intervalMonths)}
                      </p>
                    ) : null}

                    {item.notes ? (
                      <p className="mt-2 text-sm text-[var(--mt-muted)]">
                        {item.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-4 self-start">
                    <button
                      type="button"
                      onClick={() => handleComplete(item)}
                      disabled={completingId === item._id}
                      className="text-sm font-medium text-[var(--mt-ok)] underline-offset-4 transition hover:underline disabled:opacity-50"
                    >
                      {completingId === item._id
                        ? "Zapisuję…"
                        : "Odbyta wizyta"}
                    </button>
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
            ))}
          </ul>
        )}

        {!isLoading && filteredItems.length > ITEMS_PER_PAGE ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--mt-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--mt-muted)]">
              Strona {currentPage} z {totalPages}
              <span className="text-[var(--mt-muted)]/80">
                {" "}
                · {filteredItems.length} wizyt
              </span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="border border-[var(--mt-line)] px-4 py-2 text-sm font-medium text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Poprzednia
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage >= totalPages}
                className="border border-[var(--mt-line)] px-4 py-2 text-sm font-medium text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Następna
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <VisitFormModal
        isOpen={isModalOpen}
        item={editingItem}
        onClose={closeModal}
        onSaved={loadItems}
      />
    </AppShell>
  );
};

export default VisitsPage;

"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo, useState} from "react";

import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {
  INFECTIOUS_DISEASE_LABELS,
  PET_CARE_FORM_TYPES,
  PET_CARE_TYPE_LABELS,
  PET_SPECIES_LABELS,
  normalizeInfectiousDiseases,
  normalizePetCareType,
  type PetCareFormType,
  type PetSpecies,
} from "@/lib/petTypes";
import PetCareFormModal, {
  type PetCareFormValues,
} from "./PetCareFormModal";
import PetFormModal, {type PetFormValues} from "./PetFormModal";

export type PetDetailData = {
  _id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string | null;
  microchipId: string;
  vetName: string;
  vetId?: string | null;
  notes: string;
};

type PetDetailProps = {
  pet: PetDetailData;
};

type CareTab = "all" | "urgent" | PetCareFormType;

const ITEMS_PER_PAGE = 8;

const formatDate = (value: string) => {
  const [year, month, day] = toDateInputValue(value).split("-").map(Number);

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const formatDaysLeft = (days: number) => {
  if (days < 0) return `po terminie o ${Math.abs(days)} dni`;
  if (days === 0) return "dziś";
  return `za ${days} dni`;
};

const formatInterval = (months: number | null | undefined) => {
  if (!months) return null;
  if (months === 1) return "co miesiąc";
  if (months < 5) return `co ${months} miesiące`;
  return `co ${months} miesięcy`;
};

const PetDetail = ({pet: initialPet}: PetDetailProps) => {
  const router = useRouter();
  const [pet, setPet] = useState(initialPet);
  const [items, setItems] = useState<PetCareFormValues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CareTab>("all");
  const [page, setPage] = useState(1);
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PetCareFormValues | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isDeletingPet, setIsDeletingPet] = useState(false);

  const loadItems = useCallback(async () => {
    const response = await fetch(`/api/pets/${pet._id}/care`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać opieki");
    }

    const data = await response.json();
    setItems(data);
  }, [pet._id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await loadItems();
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadItems]);

  const counts = useMemo(() => {
    const result: Record<CareTab, number> = {
      all: items.length,
      urgent: items.filter((item) => item.isUrgent).length,
      rabies: 0,
      infectious: 0,
      deworming: 0,
      tick: 0,
      flea: 0,
      flea_tick: 0,
      vet_checkup: 0,
      other: 0,
    };

    for (const item of items) {
      result[normalizePetCareType(item.type)] += 1;
    }

    return result;
  }, [items]);

  const filteredItems = useMemo(() => {
    let list =
      activeTab === "all"
        ? items
        : activeTab === "urgent"
          ? items.filter((item) => item.isUrgent)
          : items.filter(
              (item) => normalizePetCareType(item.type) === activeTab
            );

    return [...list].sort((a, b) => {
      const dateOf = (item: PetCareFormValues) => {
        if (item.lastDoneAt) return new Date(item.lastDoneAt).getTime();
        if (item.nextDueAt) return new Date(item.nextDueAt).getTime();
        return 0;
      };

      return dateOf(b) - dateOf(a);
    });
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

  const tabs: {id: CareTab; label: string}[] = [
    {id: "all", label: "Wszystko"},
    {id: "urgent", label: "Kończące się"},
    ...PET_CARE_FORM_TYPES.map((type) => ({
      id: type as CareTab,
      label: PET_CARE_TYPE_LABELS[type],
    })),
  ];

  const handleComplete = async (item: PetCareFormValues) => {
    try {
      setCompletingId(item._id);
      const response = await fetch(
        `/api/pets/${pet._id}/care/${item._id}/complete`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({}),
        }
      );
      if (!response.ok) throw new Error("Nie udało się oznaczyć zabiegu");
      await loadItems();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się oznaczyć zabiegu.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (item: PetCareFormValues) => {
    const confirmed = window.confirm(
      `Usunąć „${item.name}”? Tej operacji nie da się cofnąć.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      const response = await fetch(
        `/api/pets/${pet._id}/care/${item._id}`,
        {method: "DELETE"}
      );
      if (!response.ok) throw new Error("Nie udało się usunąć zabiegu");
      await loadItems();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć zabiegu.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePet = async () => {
    const confirmed = window.confirm(
      `Usunąć zwierzę „${pet.name}” i całą jego opiekę?`
    );
    if (!confirmed) return;

    try {
      setIsDeletingPet(true);
      const response = await fetch(`/api/pets/${pet._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Nie udało się usunąć zwierzęcia");
      router.push("/pets");
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć zwierzęcia.");
      setIsDeletingPet(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/pets"
          className="text-sm text-[var(--mt-muted)] transition hover:text-[var(--mt-accent)]"
        >
          ← Zwierzęta
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
              {PET_SPECIES_LABELS[pet.species]}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">
              {pet.name}
            </h1>
            <p className="mt-2 text-[var(--mt-muted)]">
              {[
                pet.vetName ? `Wet: ${pet.vetName}` : null,
                pet.microchipId ? `Chip: ${pet.microchipId}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Szczepienia, odrobaczanie i ochrona."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setIsPetModalOpen(true)}
              className="text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
            >
              Edytuj zwierzę
            </button>
            <button
              type="button"
              onClick={handleDeletePet}
              disabled={isDeletingPet}
              className="text-sm font-medium text-[var(--mt-signal)] underline-offset-4 transition hover:underline disabled:opacity-50"
            >
              {isDeletingPet ? "Usuwanie…" : "Usuń zwierzę"}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Opieka</h2>
            <p className="mt-2 text-[var(--mt-muted)]">
              Wścieklizna, choroby zakaźne, odrobaczanie, kleszcze i pchły.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCareModalOpen(true);
            }}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj zabieg
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filtr opieki"
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
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
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
          <p className="mt-6 text-sm text-[var(--mt-muted)]">
            Ładowanie opieki…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-6 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-sm text-[var(--mt-muted)]">
              Brak zabiegów. Dodaj szczepienie, odrobaczanie albo ochronę przed
              kleszczami.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-6 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-sm text-[var(--mt-muted)]">
              Brak wpisów w tej kategorii.
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--mt-line)] border-b border-[var(--mt-line)]">
            {paginatedItems.map((item) => (
              <li key={item._id} className="py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-accent)]">
                        {PET_CARE_TYPE_LABELS[normalizePetCareType(item.type)]}
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

                    <h3 className="font-display mt-2 text-xl tracking-tight">
                      {item.name}
                    </h3>

                    {normalizePetCareType(item.type) === "infectious" &&
                    normalizeInfectiousDiseases(item.diseases).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {normalizeInfectiousDiseases(item.diseases).map(
                          (disease) => (
                            <span
                              key={disease}
                              className="border border-[var(--mt-line)] px-2.5 py-1 text-xs text-[var(--mt-ink)]"
                            >
                              {INFECTIOUS_DISEASE_LABELS[disease]}
                            </span>
                          )
                        )}
                      </div>
                    ) : null}

                    {item.nextDueAt ? (
                      <p className="mt-2 text-sm text-[var(--mt-muted)]">
                        Następny: {formatDate(item.nextDueAt)}
                        {!item.reminderDismissed && item.daysUntilDue != null
                          ? ` · ${formatDaysLeft(item.daysUntilDue)}`
                          : ""}
                      </p>
                    ) : null}

                    {item.providerName ? (
                      <p className="mt-1 text-sm text-[var(--mt-muted)]">
                        {item.providerName}
                      </p>
                    ) : null}

                    {item.lastDoneAt ? (
                      <p className="mt-1 text-sm text-[var(--mt-muted)]">
                        Ostatnio: {formatDate(item.lastDoneAt)}
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

                  <div className="flex shrink-0 flex-wrap gap-3">
                    {item.nextDueAt && !item.reminderDismissed ? (
                      <button
                        type="button"
                        onClick={() => handleComplete(item)}
                        disabled={completingId === item._id}
                        className="text-sm font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline disabled:opacity-50"
                      >
                        {completingId === item._id
                          ? "Zapisuję…"
                          : "Oznacz wykonane"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setIsCareModalOpen(true);
                      }}
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
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-sm text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)] disabled:opacity-40"
            >
              ← Poprzednia
            </button>
            <p className="text-sm text-[var(--mt-muted)]">
              {currentPage} / {totalPages}
              <span className="text-[var(--mt-muted)]/80">
                {" "}
                · {filteredItems.length} wpisów
              </span>
            </p>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-sm text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)] disabled:opacity-40"
            >
              Następna →
            </button>
          </div>
        ) : null}
      </div>

      <PetCareFormModal
        isOpen={isCareModalOpen}
        petId={pet._id}
        item={editingItem}
        onClose={() => {
          setIsCareModalOpen(false);
          setEditingItem(null);
        }}
        onSaved={loadItems}
      />

      <PetFormModal
        isOpen={isPetModalOpen}
        pet={pet as PetFormValues}
        onClose={() => setIsPetModalOpen(false)}
        onSaved={async (saved) => {
          if (saved) setPet(saved);
          router.refresh();
        }}
      />
    </>
  );
};

export default PetDetail;

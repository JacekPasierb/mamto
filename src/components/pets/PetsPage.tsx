"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

import AppShell from "@/components/dashboard/AppShell";
import {NavIcon} from "@/components/icons/NavIcons";
import {CardGridSkeleton} from "@/components/Skeleton";
import {
  PET_SPECIES_LABELS,
  type PetSpecies,
} from "@/lib/petTypes";
import PetFormModal, {type PetFormValues} from "./PetFormModal";

export type Pet = {
  _id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string | null;
  microchipId?: string;
  vetName?: string;
  notes?: string;
};

const PetsPage = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPets = async () => {
    const response = await fetch("/api/pets");

    if (!response.ok) {
      throw new Error("Nie udało się pobrać zwierząt");
    }

    const data = await response.json();
    setPets(data);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await fetchPets();
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
  }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[var(--mt-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="mt-vehicle-mark"
              style={{color: "var(--mt-accent)"}}
            >
              <NavIcon id="pets" className="mt-vehicle-icon" />
            </span>
            <div>
              <h1 className="font-display text-4xl tracking-tight">
                Zwierzęta
              </h1>
              <p className="mt-3 max-w-lg text-[var(--mt-muted)]">
                Szczepienia, odrobaczanie, kleszcze i pchły — zanim coś
                przeterminuje się.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj zwierzę
          </button>
        </div>

        {isLoading ? (
          <CardGridSkeleton className="mt-10" cards={3} />
        ) : pets.length === 0 ? (
          <div className="mt-10 flex flex-col items-center border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <span
              className="mt-vehicle-mark"
              style={{color: "var(--mt-accent)"}}
            >
              <NavIcon id="pets" className="mt-vehicle-icon" />
            </span>
            <p className="mt-5 text-[var(--mt-muted)]">
              Nie masz jeszcze żadnego zwierzęcia.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-0 border-t border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <article
                key={pet._id}
                className="group/pet border-b border-[var(--mt-line)] py-7 md:border-r md:px-6 md:first:pl-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
                  {PET_SPECIES_LABELS[pet.species] || "Zwierzę"}
                </p>
                <h2 className="font-display mt-3 text-2xl tracking-tight transition group-hover/pet:text-[var(--mt-accent)]">
                  {pet.name}
                </h2>
                {(pet.breed || pet.vetName) && (
                  <p className="mt-1 text-[var(--mt-muted)]">
                    {[pet.breed, pet.vetName].filter(Boolean).join(" · ")}
                  </p>
                )}
                <Link
                  href={`/pets/${pet._id}`}
                  className="mt-6 inline-flex text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
                >
                  Otwórz opiekę →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      <PetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchPets}
      />
    </AppShell>
  );
};

export default PetsPage;

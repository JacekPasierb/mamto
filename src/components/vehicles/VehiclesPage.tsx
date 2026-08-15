"use client";

import {useEffect, useState} from "react";

import AppShell from "@/components/dashboard/AppShell";
import {IconFleet} from "@/components/icons/VehicleIcons";
import VehicleFormModal from "./VehicleFormModal";
import VehicleCard from "./VehicleCard";

export type Vehicle = {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year?: number | null;
  vin?: string;
  plateNumber?: string;
  mileage: number;
  type: "car" | "motorcycle" | "other";
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = async () => {
    const response = await fetch("/api/vehicles");

    if (!response.ok) {
      throw new Error("Nie udało się pobrać pojazdów");
    }

    const data = await response.json();

    setVehicles(data);
  };

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");

        if (!response.ok) {
          throw new Error("Nie udało się pobrać pojazdów");
        }

        const data = await response.json();

        if (!cancelled) {
          setVehicles(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();

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
              <IconFleet />
            </span>
            <div>
              <h1 className="font-display text-4xl tracking-tight">Pojazdy</h1>
              <p className="mt-3 max-w-lg text-[var(--mt-muted)]">
                Przeglądy, olej, opony — wszystko, o czym nie wolno zapomnieć.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj pojazd
          </button>
        </div>

        {isLoading ? (
          <p className="mt-10 text-[var(--mt-muted)]">Ładowanie pojazdów…</p>
        ) : vehicles.length === 0 ? (
          <div className="mt-10 flex flex-col items-center border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <span
              className="mt-vehicle-mark"
              style={{color: "var(--mt-accent)"}}
            >
              <IconFleet />
            </span>
            <p className="mt-5 text-[var(--mt-muted)]">
              Nie masz jeszcze żadnego pojazdu.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-0 border-t border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchVehicles}
      />
    </AppShell>
  );
};

export default VehiclesPage;

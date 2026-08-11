"use client";

import {useEffect, useState} from "react";

import AppShell from "@/components/dashboard/AppShell";
import AddVehicleModal from "./AddVehicleModal";
import VehicleCard from "./VehicleCard";

export type Vehicle = {
  _id: string;
  name: string;
  brand: string;
  model: string;
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
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
              Moduł 02
            </p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">Pojazdy</h1>
            <p className="mt-3 max-w-lg text-[var(--mt-muted)]">
              Przeglądy, olej, opony — wszystko, o czym nie wolno zapomnieć.
            </p>
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
          <div className="mt-10 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-[var(--mt-muted)]">
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

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchVehicles}
      />
    </AppShell>
  );
};

export default VehiclesPage;

"use client";

import {useEffect, useState} from "react";

export type VehicleFormValues = {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  vin: string;
  plateNumber: string;
  mileage: number;
  type: "car" | "motorcycle" | "other";
};

type VehicleFormModalProps = {
  isOpen: boolean;
  vehicle?: VehicleFormValues | null;
  onClose: () => void;
  onSaved: (vehicle?: VehicleFormValues) => Promise<void> | void;
};

const VehicleFormModal = ({
  isOpen,
  vehicle = null,
  onClose,
  onSaved,
}: VehicleFormModalProps) => {
  const isEditing = Boolean(vehicle);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [mileage, setMileage] = useState("");
  const [type, setType] = useState<"car" | "motorcycle" | "other">("car");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (vehicle) {
      setName(vehicle.name);
      setBrand(vehicle.brand || "");
      setModel(vehicle.model || "");
      setYear(vehicle.year == null ? "" : String(vehicle.year));
      setVin(vehicle.vin || "");
      setPlateNumber(vehicle.plateNumber || "");
      setMileage(String(vehicle.mileage ?? ""));
      setType(vehicle.type || "car");
    } else {
      setName("");
      setBrand("");
      setModel("");
      setYear("");
      setVin("");
      setPlateNumber("");
      setMileage("");
      setType("car");
    }

    setError("");
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        brand,
        model,
        year: year || null,
        vin,
        plateNumber,
        mileage,
        type,
      };

      const response = await fetch(
        isEditing ? `/api/vehicles/${vehicle!._id}` : "/api/vehicles",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message ||
            (isEditing
              ? "Nie udało się zaktualizować pojazdu"
              : "Nie udało się dodać pojazdu")
        );
      }

      const saved = await response.json();

      await onSaved({
        _id: String(saved._id),
        name: saved.name,
        brand: saved.brand || "",
        model: saved.model || "",
        year: saved.year ?? null,
        vin: saved.vin || "",
        plateNumber: saved.plateNumber || "",
        mileage: saved.mileage || 0,
        type: saved.type || "car",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Nie udało się zaktualizować pojazdu."
            : "Nie udało się dodać pojazdu."
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
              Pojazd
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj pojazd" : "Dodaj pojazd"}
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
              placeholder="Np. Mój Hyundai"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Typ
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "car" | "motorcycle" | "other")
              }
              className={fieldClass}
            >
              <option value="car">Samochód</option>
              <option value="motorcycle">Motocykl</option>
              <option value="other">Inny</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Marka
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Hyundai"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Model
              </label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="i30"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Rok produkcji
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2018"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Nr rejestracyjny
              </label>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="WZ 12345"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              VIN
            </label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="17-znakowy numer VIN"
              maxLength={17}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Aktualny przebieg
            </label>
            <input
              type="number"
              min="0"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="122000"
              className={fieldClass}
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
                  : "Dodaj pojazd"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;

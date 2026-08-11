"use client";

import {useState} from "react";

type AddVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

const AddVehicleModal = ({
  isOpen,
  onClose,
  onCreated,
}: AddVehicleModalProps) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [type, setType] = useState<"car" | "motorcycle" | "other">("car");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          brand,
          model,
          mileage,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się dodać pojazdu");
      }

      setName("");
      setBrand("");
      setModel("");
      setMileage("");
      setType("car");

      await onCreated();

      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się dodać pojazdu.");
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Nowy wpis
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              Dodaj pojazd
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

          {error && (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {isSaving ? "Dodawanie…" : "Dodaj pojazd"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;

"use client";

import {useEffect, useState} from "react";
import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {
  INSURANCE_FORM_TYPES,
  INSURANCE_PAYMENT_FREQUENCIES,
  INSURANCE_PAYMENT_LABELS,
  INSURANCE_TYPE_LABELS,
  isVehicleInsurance,
  normalizeInsuranceType,
  type InsurancePaymentFrequency,
  type InsuranceType,
} from "@/lib/insuranceTypes";

export type InsuranceFormValues = {
  _id: string;
  name: string;
  type: InsuranceType;
  insurer: string;
  policyNumber: string;
  startsAt: string | null;
  endsAt: string;
  premium: number | null;
  paymentFrequency: InsurancePaymentFrequency;
  vehicleId: string | null;
  vehicleName?: string | null;
  notes: string;
  daysUntilEnd?: number;
  isOverdue?: boolean;
  isUrgent?: boolean;
};

type VehicleOption = {
  _id: string;
  name: string;
};

type InsuranceFormModalProps = {
  isOpen: boolean;
  item?: InsuranceFormValues | null;
  vehicles: VehicleOption[];
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const InsuranceFormModal = ({
  isOpen,
  item = null,
  vehicles,
  onClose,
  onSaved,
}: InsuranceFormModalProps) => {
  const isEditing = Boolean(item);

  const [name, setName] = useState("");
  const [type, setType] = useState<InsuranceType>("vehicle");
  const [insurer, setInsurer] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [premium, setPremium] = useState("");
  const [paymentFrequency, setPaymentFrequency] =
    useState<InsurancePaymentFrequency>("yearly");
  const [vehicleId, setVehicleId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setName(item.name);
      setType(normalizeInsuranceType(item.type));
      setInsurer(item.insurer || "");
      setPolicyNumber(item.policyNumber || "");
      setStartsAt(toDateInputValue(item.startsAt) || "");
      setEndsAt(toDateInputValue(item.endsAt) || "");
      setPremium(item.premium == null ? "" : String(item.premium));
      setPaymentFrequency(item.paymentFrequency || "yearly");
      setVehicleId(item.vehicleId ? String(item.vehicleId) : "");
      setNotes(item.notes || "");
    } else {
      setName("");
      setType("vehicle");
      setInsurer("");
      setPolicyNumber("");
      setStartsAt("");
      setEndsAt("");
      setPremium("");
      setPaymentFrequency("yearly");
      setVehicleId("");
      setNotes("");
    }

    setError("");
  }, [isOpen, item]);

  if (!isOpen) return null;

  const showVehicleField = isVehicleInsurance(type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        type,
        insurer,
        policyNumber,
        startsAt: startsAt || null,
        endsAt,
        premium: premium || null,
        paymentFrequency,
        vehicleId: showVehicleField && vehicleId ? vehicleId : null,
        notes,
      };

      const response = await fetch(
        isEditing ? `/api/insurance/${item!._id}` : "/api/insurance",
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
              ? "Nie udało się zaktualizować polisy"
              : "Nie udało się dodać polisy")
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
            ? "Nie udało się zaktualizować polisy."
            : "Nie udało się dodać polisy."
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
              Ubezpieczenia
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj polisę" : "Dodaj polisę"}
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
              placeholder="Np. OC samochodu / mieszkanie na Wilanowie"
              required
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Typ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InsuranceType)}
                className={fieldClass}
              >
                {INSURANCE_FORM_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {INSURANCE_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Ubezpieczyciel
              </label>
              <input
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                placeholder="Np. PZU"
                className={fieldClass}
              />
            </div>
          </div>

          {showVehicleField && vehicles.length > 0 ? (
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Pojazd
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Bez powiązania</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Numer polisy
            </label>
            <input
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="Opcjonalnie"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Początek
              </label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Koniec
              </label>
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Składka (zł)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                placeholder="Opcjonalnie"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Płatność
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) =>
                  setPaymentFrequency(
                    e.target.value as InsurancePaymentFrequency
                  )
                }
                className={fieldClass}
              >
                {INSURANCE_PAYMENT_FREQUENCIES.map((value) => (
                  <option key={value} value={value}>
                    {INSURANCE_PAYMENT_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Zakres, franszyza, uwagi…"
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
                  : "Dodaj polisę"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceFormModal;

"use client";

import {useEffect, useState} from "react";
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  type ServiceType,
} from "@/lib/serviceTypes";
import {addYearsToDateInput} from "@/lib/serviceDefaults";
import {
  PERFORMED_BY_OPTIONS,
  PERFORMED_BY_LABELS,
  type PerformedBy,
} from "@/lib/workshopTypes";
import WorkshopCombobox from "./WorkshopCombobox";

export type ServiceFormValues = {
  _id: string;
  type: ServiceType;
  title: string;
  performedAt: string;
  mileage: number;
  nextDueAt: string | null;
  nextDueMileage: number | null;
  performedBy: PerformedBy;
  workshopId: string | null;
  workshopName: string | null;
  notes: string;
  cost: number | null;
};

type ServiceFormModalProps = {
  vehicleId: string;
  currentMileage: number;
  isOpen: boolean;
  service?: ServiceFormValues | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const toDateInput = (value: string | null | undefined) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ServiceFormModal = ({
  vehicleId,
  currentMileage,
  isOpen,
  service = null,
  onClose,
  onSaved,
}: ServiceFormModalProps) => {
  const isEditing = Boolean(service);

  const [type, setType] = useState<ServiceType>("oil");
  const [title, setTitle] = useState(SERVICE_TYPE_LABELS.oil);
  const [performedAt, setPerformedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [mileage, setMileage] = useState(String(currentMileage || ""));
  const [nextDueAt, setNextDueAt] = useState("");
  const [nextDueMileage, setNextDueMileage] = useState("");
  const [performedBy, setPerformedBy] = useState<PerformedBy>("workshop");
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [workshopName, setWorkshopName] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (service) {
      setType(service.type);
      setTitle(service.title);
      setPerformedAt(toDateInput(service.performedAt));
      setMileage(String(service.mileage ?? ""));
      setNextDueAt(toDateInput(service.nextDueAt));
      setNextDueMileage(
        service.nextDueMileage == null ? "" : String(service.nextDueMileage)
      );
      setPerformedBy(service.performedBy || "other");
      setWorkshopId(service.workshopId ? String(service.workshopId) : null);
      setWorkshopName(service.workshopName || "");
      setNotes(service.notes || "");
      setCost(service.cost == null ? "" : String(service.cost));
    } else {
      setType("oil");
      setTitle(SERVICE_TYPE_LABELS.oil);
      setPerformedAt(new Date().toISOString().slice(0, 10));
      setMileage(String(currentMileage || ""));
      setNextDueAt("");
      setNextDueMileage("");
      setPerformedBy("workshop");
      setWorkshopId(null);
      setWorkshopName("");
      setNotes("");
      setCost("");
    }

    setError("");
  }, [isOpen, service, currentMileage]);

  if (!isOpen) return null;

  const handleTypeChange = (value: ServiceType) => {
    setType(value);

    if (!isEditing || title === SERVICE_TYPE_LABELS[type]) {
      setTitle(SERVICE_TYPE_LABELS[value]);
    }

    if (value === "inspection") {
      setNextDueAt(addYearsToDateInput(performedAt, 1));
    }
  };

  const handlePerformedAtChange = (value: string) => {
    setPerformedAt(value);

    if (type === "inspection") {
      setNextDueAt(addYearsToDateInput(value, 1));
    }
  };

  const handlePerformedByChange = (value: PerformedBy) => {
    setPerformedBy(value);

    if (value !== "workshop") {
      setWorkshopId(null);
      setWorkshopName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        type,
        title,
        performedAt,
        mileage,
        nextDueAt: nextDueAt || null,
        nextDueMileage: nextDueMileage || null,
        performedBy,
        workshopId: performedBy === "workshop" ? workshopId : null,
        workshopName: performedBy === "workshop" ? workshopName : null,
        notes,
        cost: cost || null,
      };

      const response = await fetch(
        isEditing
          ? `/api/vehicles/${vehicleId}/services/${service!._id}`
          : `/api/vehicles/${vehicleId}/services`,
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
              ? "Nie udało się zaktualizować serwisu"
              : "Nie udało się dodać serwisu")
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
            ? "Nie udało się zaktualizować serwisu."
            : "Nie udało się dodać serwisu."
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
              Historia serwisowa
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              {isEditing ? "Edytuj serwis" : "Dodaj serwis"}
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
              Typ
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ServiceType)}
              className={fieldClass}
            >
              {SERVICE_TYPES.map((serviceType) => (
                <option key={serviceType} value={serviceType}>
                  {SERVICE_TYPE_LABELS[serviceType]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Tytuł
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Np. Wymiana oleju 5W-30"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-3 block text-sm text-[var(--mt-muted)]">
              Wykonane przez
            </label>
            <div className="space-y-2">
              {PERFORMED_BY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 text-sm text-[var(--mt-ink)]"
                >
                  <input
                    type="radio"
                    name="performedBy"
                    value={option}
                    checked={performedBy === option}
                    onChange={() => handlePerformedByChange(option)}
                    className="h-4 w-4 accent-[var(--mt-accent)]"
                  />
                  {PERFORMED_BY_LABELS[option]}
                </label>
              ))}
            </div>
          </div>

          {performedBy === "workshop" ? (
            <WorkshopCombobox
              value={workshopName}
              workshopId={workshopId}
              onChange={(name, id) => {
                setWorkshopName(name);
                setWorkshopId(id);
              }}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Data wykonania
              </label>
              <input
                type="date"
                value={performedAt}
                onChange={(e) => handlePerformedAtChange(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Przebieg (km)
              </label>
              <input
                type="number"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder={String(currentMileage || 0)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Następny termin
              </label>
              <input
                type="date"
                value={nextDueAt}
                onChange={(e) => setNextDueAt(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Następny przebieg
              </label>
              <input
                type="number"
                min="0"
                value={nextDueMileage}
                onChange={(e) => setNextDueMileage(e.target.value)}
                placeholder="Np. 135000"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Koszt (zł)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Opcjonalnie"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Części, uwagi…"
              className={`${fieldClass} resize-y`}
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
            {isSaving
              ? "Zapisywanie…"
              : isEditing
                ? "Zapisz zmiany"
                : "Zapisz serwis"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;

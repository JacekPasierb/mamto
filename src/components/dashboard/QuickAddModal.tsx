"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {NavIcon, type NavIconId} from "@/components/icons/NavIcons";
import InsuranceFormModal from "@/components/insurance/InsuranceFormModal";
import DocumentFormModal from "@/components/documents/DocumentFormModal";
import StockFormModal from "@/components/stock/StockFormModal";
import VehicleFormModal from "@/components/vehicles/VehicleFormModal";
import {useSettings, type Modules} from "@/context/SettingsContext";

type QuickKind = "vehicle" | "insurance" | "documents" | "stock";

type QuickOption = {
  kind: QuickKind;
  label: string;
  hint: string;
  icon: NavIconId;
  moduleKey: keyof Modules;
};

const OPTIONS: QuickOption[] = [
  {
    kind: "vehicle",
    label: "Pojazd",
    hint: "Samochód, motocykl lub inny",
    icon: "vehicles",
    moduleKey: "vehicles",
  },
  {
    kind: "insurance",
    label: "Polisa",
    hint: "OC, dom, życie i inne",
    icon: "insurance",
    moduleKey: "insurance",
  },
  {
    kind: "documents",
    label: "Dokument osobisty",
    hint: "Ważność dokumentu",
    icon: "documents",
    moduleKey: "documents",
  },
  {
    kind: "stock",
    label: "Zapas",
    hint: "Lek, soczewki, domowe zapasy",
    icon: "stock",
    moduleKey: "stock",
  },
];

type QuickAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const QuickAddModal = ({isOpen, onClose, onSaved}: QuickAddModalProps) => {
  const router = useRouter();
  const {modules, isLoading} = useSettings();
  const [step, setStep] = useState<"pick" | QuickKind>("pick");
  const [vehicles, setVehicles] = useState<{_id: string; name: string}[]>([]);

  const visibleOptions = useMemo(
    () =>
      OPTIONS.filter((option) =>
        isLoading ? false : Boolean(modules?.[option.moduleKey])
      ),
    [modules, isLoading]
  );

  useEffect(() => {
    if (!isOpen) {
      setStep("pick");
      return;
    }

    setStep("pick");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== "insurance") return;

    let cancelled = false;

    const loadVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setVehicles(
            (data || []).map((item: {_id: string; name: string}) => ({
              _id: String(item._id),
              name: item.name,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleSaved = async () => {
    await onSaved();
    onClose();
    router.refresh();
  };

  const handleFormClose = () => {
    // Po zapisie formularz też woła onClose — wtedy cały modal już się zamyka.
    // Przy anulowaniu wracamy do wyboru typu.
    setStep("pick");
  };

  if (step === "vehicle") {
    return (
      <VehicleFormModal
        isOpen
        onClose={handleFormClose}
        onSaved={handleSaved}
      />
    );
  }

  if (step === "insurance") {
    return (
      <InsuranceFormModal
        isOpen
        vehicles={vehicles}
        onClose={handleFormClose}
        onSaved={handleSaved}
      />
    );
  }

  if (step === "documents") {
    return (
      <DocumentFormModal
        isOpen
        onClose={handleFormClose}
        onSaved={handleSaved}
      />
    );
  }

  if (step === "stock") {
    return (
      <StockFormModal isOpen onClose={handleFormClose} onSaved={handleSaved} />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mt-ink)]/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-[var(--mt-line)] bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
              Szybka akcja
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-tight">
              Co chcesz dodać?
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

        {isLoading ? (
          <p className="mt-8 text-sm text-[var(--mt-muted)]">Ładowanie…</p>
        ) : visibleOptions.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--mt-muted)]">
            Włącz obszary w ustawieniach, żeby coś dodać.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)]">
            {visibleOptions.map((option) => (
              <button
                key={option.kind}
                type="button"
                onClick={() => setStep(option.kind)}
                className="group flex w-full items-center gap-4 py-4 text-left transition hover:bg-[var(--mt-bg)]/60"
              >
                <span className="flex h-10 w-10 items-center justify-center border border-[var(--mt-line)] text-[var(--mt-ink)] transition group-hover:border-[var(--mt-accent)] group-hover:text-[var(--mt-accent)]">
                  <NavIcon id={option.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.98rem] font-medium leading-none">
                    {option.label}
                  </span>
                  <span className="mt-1.5 block text-[0.75rem] text-[var(--mt-muted)]">
                    {option.hint}
                  </span>
                </span>
                <span className="text-sm text-[var(--mt-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--mt-accent)]">
                  →
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-[var(--mt-line)] px-4 py-3.5 text-sm font-semibold text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)]"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};

export default QuickAddModal;

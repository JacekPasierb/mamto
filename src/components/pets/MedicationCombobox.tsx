"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {DropdownSkeleton} from "@/components/Skeleton";

export type MedicationOption = {
  _id: string;
  name: string;
};

type MedicationComboboxProps = {
  value: string;
  medicationId: string | null;
  onChange: (name: string, medicationId: string | null) => void;
  disabled?: boolean;
};

const MedicationCombobox = ({
  value,
  medicationId,
  onChange,
  disabled = false,
}: MedicationComboboxProps) => {
  const [medications, setMedications] = useState<MedicationOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMedications = useCallback(async (query = "") => {
    setIsLoading(true);

    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/medications${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać leków");
      }

      const data = await response.json();
      setMedications(data);
    } catch (error) {
      console.error(error);
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const trimmedValue = value.trim();

  const suggestions = useMemo(() => {
    const query = trimmedValue.toLowerCase();

    if (!query) {
      return medications;
    }

    return medications.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [medications, trimmedValue]);

  const exactMatch = useMemo(() => {
    if (!trimmedValue) return null;

    return (
      medications.find(
        (item) => item.name.toLowerCase() === trimmedValue.toLowerCase()
      ) || null
    );
  }, [medications, trimmedValue]);

  const canCreateNew = Boolean(trimmedValue) && !exactMatch && !medicationId;

  const handleInputChange = (nextValue: string) => {
    setCreateError("");
    onChange(nextValue, null);
    setIsOpen(true);
    loadMedications(nextValue);
  };

  const handleSelect = (item: MedicationOption) => {
    setCreateError("");
    onChange(item.name, item._id);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!canCreateNew || isCreating) return;

    try {
      setIsCreating(true);
      setCreateError("");

      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: trimmedValue}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Nie udało się dodać leku");
      }

      const created = await response.json();
      onChange(created.name, String(created._id));
      await loadMedications();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      setCreateError(
        error instanceof Error ? error.message : "Nie udało się dodać leku."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm text-[var(--mt-muted)]">
        Preparat / lek
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canCreateNew) {
            e.preventDefault();
            handleCreate();
          }
        }}
        disabled={disabled}
        placeholder="Np. Vectra 3D, Bravecto…"
        autoComplete="off"
        className={fieldClass}
      />

      {medicationId ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Wybrano zapisany lek.
        </p>
      ) : canCreateNew ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Wpisz nazwę i wybierz „Dodaj”, albo naciśnij Enter — albo zapisz
          zabieg, a lek zapisze się sam.
        </p>
      ) : null}

      {createError ? (
        <p className="mt-2 text-xs text-[var(--mt-signal)]">{createError}</p>
      ) : null}

      {isOpen && !disabled ? (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border border-[var(--mt-line)] bg-white shadow-sm">
          {isLoading ? (
            <DropdownSkeleton />
          ) : (
            <>
              {canCreateNew ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="block w-full border-b border-[var(--mt-line)] px-4 py-3 text-left text-sm font-medium text-[var(--mt-accent)] transition hover:bg-[var(--mt-bg)] disabled:opacity-50"
                >
                  {isCreating ? "Dodaję…" : `Dodaj „${trimmedValue}”`}
                </button>
              ) : null}

              {suggestions.length === 0 && !canCreateNew ? (
                <p className="px-4 py-3 text-sm text-[var(--mt-muted)]">
                  Brak zapisanych leków.
                </p>
              ) : (
                <ul>
                  {suggestions.map((item) => (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--mt-bg)] ${
                          medicationId === item._id
                            ? "bg-[var(--mt-bg)] font-medium text-[var(--mt-ink)]"
                            : "text-[var(--mt-ink)]"
                        }`}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MedicationCombobox;

"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

export type WorkshopOption = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
};

type WorkshopComboboxProps = {
  value: string;
  workshopId: string | null;
  onChange: (name: string, workshopId: string | null) => void;
  disabled?: boolean;
};

const WorkshopCombobox = ({
  value,
  workshopId,
  onChange,
  disabled = false,
}: WorkshopComboboxProps) => {
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadWorkshops = useCallback(async (query = "") => {
    setIsLoading(true);

    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/workshops${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać warsztatów");
      }

      const data = await response.json();
      setWorkshops(data);
    } catch (error) {
      console.error(error);
      setWorkshops([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

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

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return workshops;
    }

    return workshops.filter((workshop) =>
      workshop.name.toLowerCase().includes(query)
    );
  }, [workshops, value]);

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue, null);
    setIsOpen(true);
    loadWorkshops(nextValue);
  };

  const handleSelect = (workshop: WorkshopOption) => {
    onChange(workshop.name, workshop._id);
    setIsOpen(false);
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm text-[var(--mt-muted)]">
        Nazwa warsztatu
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder="Wpisz lub wybierz warsztat"
        required
        autoComplete="off"
        className={fieldClass}
      />

      {workshopId ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Wybrano zapisany warsztat.
        </p>
      ) : value.trim() ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Nowy warsztat zostanie zapisany przy zapisie serwisu.
        </p>
      ) : null}

      {isOpen && !disabled ? (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border border-[var(--mt-line)] bg-white shadow-sm">
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-[var(--mt-muted)]">
              Ładowanie…
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--mt-muted)]">
              {value.trim()
                ? "Brak dopasowań — zostanie utworzony nowy warsztat."
                : "Brak zapisanych warsztatów."}
            </p>
          ) : (
            <ul>
              {suggestions.map((workshop) => (
                <li key={workshop._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(workshop)}
                    className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--mt-bg)] ${
                      workshopId === workshop._id
                        ? "bg-[var(--mt-bg)] font-medium text-[var(--mt-ink)]"
                        : "text-[var(--mt-ink)]"
                    }`}
                  >
                    <span>{workshop.name}</span>
                    {workshop.address ? (
                      <span className="mt-1 block text-xs text-[var(--mt-muted)]">
                        {workshop.address}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default WorkshopCombobox;

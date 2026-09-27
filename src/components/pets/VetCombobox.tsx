"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

export type VetOption = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
};

type VetComboboxProps = {
  value: string;
  vetId: string | null;
  onChange: (name: string, vetId: string | null) => void;
  disabled?: boolean;
  required?: boolean;
};

const VetCombobox = ({
  value,
  vetId,
  onChange,
  disabled = false,
  required = false,
}: VetComboboxProps) => {
  const [vets, setVets] = useState<VetOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadVets = useCallback(async (query = "") => {
    setIsLoading(true);

    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/vets${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać weterynarii");
      }

      const data = await response.json();
      setVets(data);
    } catch (error) {
      console.error(error);
      setVets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVets();
  }, [loadVets]);

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
      return vets;
    }

    return vets.filter((vet) => vet.name.toLowerCase().includes(query));
  }, [vets, value]);

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue, null);
    setIsOpen(true);
    loadVets(nextValue);
  };

  const handleSelect = (vet: VetOption) => {
    onChange(vet.name, vet._id);
    setIsOpen(false);
  };

  const fieldClass =
    "w-full border border-[var(--mt-line)] bg-[var(--mt-bg)] px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm text-[var(--mt-muted)]">
        Weterynarz
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder="Wpisz lub wybierz klinikę / lekarza"
        required={required}
        autoComplete="off"
        className={fieldClass}
      />

      {vetId ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Wybrano zapisaną weterynarię.
        </p>
      ) : value.trim() ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Nowa weterynaria zostanie zapisana przy zapisie zwierzęcia.
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
                ? "Brak dopasowań — zostanie utworzona nowa weterynaria."
                : "Brak zapisanych weterynarii."}
            </p>
          ) : (
            <ul>
              {suggestions.map((vet) => (
                <li key={vet._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(vet)}
                    className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--mt-bg)] ${
                      vetId === vet._id
                        ? "bg-[var(--mt-bg)] font-medium text-[var(--mt-ink)]"
                        : "text-[var(--mt-ink)]"
                    }`}
                  >
                    <span>{vet.name}</span>
                    {vet.address ? (
                      <span className="mt-1 block text-xs text-[var(--mt-muted)]">
                        {vet.address}
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

export default VetCombobox;

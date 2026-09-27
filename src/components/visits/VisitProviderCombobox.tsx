"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {DropdownSkeleton} from "@/components/Skeleton";
import {
  type VisitFormType,
  VISIT_TYPE_LABELS,
} from "@/lib/visitTypes";

export type VisitProviderOption = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
};

type VisitProviderComboboxProps = {
  category: VisitFormType;
  value: string;
  providerId: string | null;
  onChange: (name: string, providerId: string | null) => void;
  disabled?: boolean;
};

const PROVIDER_COPY: Record<
  VisitFormType,
  {label: string; placeholder: string; empty: string; selected: string}
> = {
  health: {
    label: "Lekarz / placówka",
    placeholder: "Wpisz lub wybierz lekarza / klinikę",
    empty: "Brak zapisanych lekarzy i placówek.",
    selected: "Wybrano zapisaną placówkę.",
  },
  dental: {
    label: "Gabinet / dentysta",
    placeholder: "Wpisz lub wybierz gabinet",
    empty: "Brak zapisanych gabinetów.",
    selected: "Wybrano zapisany gabinet.",
  },
  beauty: {
    label: "Salon / specjalista",
    placeholder: "Wpisz lub wybierz salon",
    empty: "Brak zapisanych salonów.",
    selected: "Wybrano zapisany salon.",
  },
  hair: {
    label: "Fryzjer / salon",
    placeholder: "Wpisz lub wybierz fryzjera",
    empty: "Brak zapisanych fryzjerów.",
    selected: "Wybrano zapisanego fryzjera.",
  },
  other: {
    label: "Specjalista / miejsce",
    placeholder: "Wpisz lub wybierz z listy",
    empty: "Brak zapisanych miejsc.",
    selected: "Wybrano zapisane miejsce.",
  },
};

const VisitProviderCombobox = ({
  category,
  value,
  providerId,
  onChange,
  disabled = false,
}: VisitProviderComboboxProps) => {
  const [providers, setProviders] = useState<VisitProviderOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const copy = PROVIDER_COPY[category];

  const loadProviders = useCallback(
    async (query = "") => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({category});
        if (query) params.set("q", query);

        const response = await fetch(`/api/visit-providers?${params}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać listy");
        }

        const data = await response.json();
        setProviders(data);
      } catch (error) {
        console.error(error);
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

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
      return providers;
    }

    return providers.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [providers, trimmedValue]);

  const exactMatch = useMemo(() => {
    if (!trimmedValue) return null;

    return (
      providers.find(
        (item) => item.name.toLowerCase() === trimmedValue.toLowerCase()
      ) || null
    );
  }, [providers, trimmedValue]);

  const canCreateNew = Boolean(trimmedValue) && !exactMatch && !providerId;

  const handleInputChange = (nextValue: string) => {
    setCreateError("");
    onChange(nextValue, null);
    setIsOpen(true);
    loadProviders(nextValue);
  };

  const handleSelect = (item: VisitProviderOption) => {
    setCreateError("");
    onChange(item.name, item._id);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!canCreateNew || isCreating) return;

    try {
      setIsCreating(true);
      setCreateError("");

      const response = await fetch("/api/visit-providers", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: trimmedValue, category}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Nie udało się dodać do listy");
      }

      const created = await response.json();
      onChange(created.name, String(created._id));
      await loadProviders();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      setCreateError(
        error instanceof Error
          ? error.message
          : "Nie udało się dodać do listy."
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
        {copy.label}
        <span className="ml-1 text-[var(--mt-muted)]/70">
          · {VISIT_TYPE_LABELS[category]}
        </span>
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
        placeholder={copy.placeholder}
        autoComplete="off"
        className={fieldClass}
      />

      {providerId ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">{copy.selected}</p>
      ) : canCreateNew ? (
        <p className="mt-2 text-xs text-[var(--mt-muted)]">
          Wpisz nazwę i wybierz „Dodaj”, albo naciśnij Enter — albo zapisz
          wizytę, a wpis dopisze się sam.
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
                  {isCreating
                    ? "Dodaję…"
                    : `Dodaj „${trimmedValue}”`}
                </button>
              ) : null}

              {suggestions.length === 0 && !canCreateNew ? (
                <p className="px-4 py-3 text-sm text-[var(--mt-muted)]">
                  {copy.empty}
                </p>
              ) : (
                <ul>
                  {suggestions.map((item) => (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--mt-bg)] ${
                          providerId === item._id
                            ? "bg-[var(--mt-bg)] font-medium text-[var(--mt-ink)]"
                            : "text-[var(--mt-ink)]"
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.address ? (
                          <span className="mt-1 block text-xs text-[var(--mt-muted)]">
                            {item.address}
                          </span>
                        ) : null}
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

export default VisitProviderCombobox;

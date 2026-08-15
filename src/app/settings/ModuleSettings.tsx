"use client";

import Link from "next/link";
import {useState} from "react";
import AppShell from "@/components/dashboard/AppShell";
import {NavIcon, type NavIconId} from "@/components/icons/NavIcons";
import {Modules, useSettings} from "@/context/SettingsContext";

const moduleRows: {
  key: keyof Modules;
  title: string;
  description: string;
  icon: NavIconId;
}[] = [
  {
    key: "vehicles",
    title: "Serwis pojazdów",
    description:
      "Olej, wycieraczki, opony, przeglądy i inne czynności serwisowe.",
    icon: "vehicles",
  },
  {
    key: "insurance",
    title: "Ubezpieczenia",
    description: "OC, AC, ubezpieczenie domu, mieszkania i inne polisy.",
    icon: "insurance",
  },
  {
    key: "documents",
    title: "Dokumenty osobiste",
    description: "Ważność dokumentów osobistych w jednym miejscu.",
    icon: "documents",
  },
  {
    key: "beauty",
    title: "Wizyty",
    description:
      "Lekarze, stomatolodzy, fryzjer, paznokcie, rzęsy i inne systematyczne wizyty.",
    icon: "visits",
  },
  {
    key: "stock",
    title: "Zapasy",
    description: "Leki, soczewki i inne rzeczy, które mogą się kończyć.",
    icon: "stock",
  },
];

const ModuleSettings = () => {
  const {modules, isLoading, updateModules} = useSettings();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async (module: keyof Modules) => {
    if (!modules) return;

    const updatedModules = {
      ...modules,
      [module]: !modules[module],
    };

    try {
      setIsSaving(true);
      setError("");

      await updateModules(updatedModules);
    } catch (err) {
      console.error(err);
      setError("Nie udało się zapisać ustawień.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !modules) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <p className="text-[var(--mt-muted)]">Ładowanie ustawień…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
          Preferencje
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight">Ustawienia</h1>
        <p className="mt-3 text-[var(--mt-muted)]">
          Wybierz, co MamTo ma pilnować za Ciebie.
        </p>

        {isSaving && (
          <p className="mt-4 text-sm text-[var(--mt-muted)]">Zapisywanie…</p>
        )}

        {error && <p className="mt-4 text-sm text-[var(--mt-signal)]">{error}</p>}

        <div className="mt-10 divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)]">
          {moduleRows.map((row) => (
            <ModuleRow
              key={row.key}
              title={row.title}
              description={row.description}
              icon={row.icon}
              enabled={modules[row.key]}
              onToggle={() => handleToggle(row.key)}
            />
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--mt-line)] pt-8">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Dokumenty prawne
          </p>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href="/regulamin"
              className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
            >
              Regulamin
            </Link>
            <Link
              href="/polityka-prywatnosci"
              className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
            >
              Polityka prywatności
            </Link>
            <Link
              href="/cookies"
              className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
            >
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </AppShell>
  );
};

type ModuleRowProps = {
  title: string;
  description: string;
  icon: NavIconId;
  enabled: boolean;
  onToggle: () => void;
};

const ModuleRow = ({
  title,
  description,
  icon,
  enabled,
  onToggle,
}: ModuleRowProps) => {
  return (
    <div className="flex items-center justify-between gap-6 py-6">
      <div className="flex items-start gap-4">
        <span
          className={`mt-0.5 flex h-11 w-11 items-center justify-center border transition ${
            enabled
              ? "border-[var(--mt-accent)] text-[var(--mt-accent)]"
              : "border-[var(--mt-line)] text-[var(--mt-muted)]"
          }`}
        >
          <NavIcon id={icon} active={enabled} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg tracking-tight">{title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--mt-muted)]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 transition ${
          enabled ? "bg-[var(--mt-accent)]" : "bg-[var(--mt-bg-deep)]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 bg-white transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

export default ModuleSettings;

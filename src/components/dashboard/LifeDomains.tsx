"use client";

import Link from "next/link";
import {useSettings, type Modules} from "@/context/SettingsContext";
import {NavIcon, type NavIconId} from "@/components/icons/NavIcons";

const domains: {
  key: keyof Modules;
  href: string;
  title: string;
  line: string;
  icon: NavIconId;
}[] = [
  {
    key: "vehicles",
    href: "/vehicles",
    title: "Pojazdy",
    line: "Przeglądy, olej, opony — zanim zapomnisz.",
    icon: "vehicles",
  },
  {
    key: "insurance",
    href: "/insurance",
    title: "Ubezpieczenia",
    line: "OC, dom, mieszkanie — daty pod kontrolą.",
    icon: "insurance",
  },
  {
    key: "documents",
    href: "/documents",
    title: "Dokumenty osobiste",
    line: "Terminy ważności — zanim coś wygaśnie.",
    icon: "documents",
  },
  {
    key: "stock",
    href: "/stock",
    title: "Zapasy",
    line: "Leki i rzeczy, których nie może zabraknąć.",
    icon: "stock",
  },
  {
    key: "beauty",
    href: "/visits",
    title: "Wizyty",
    line: "Lekarze, stomatolodzy, fryzjer, paznokcie — systematycznie.",
    icon: "visits",
  },
];

const LifeDomains = () => {
  const {modules, isLoading} = useSettings();

  const visible = domains.filter((domain) =>
    isLoading ? true : modules?.[domain.key]
  );

  if (!isLoading && visible.length === 0) {
    return (
      <section className="mt-rise mt-rise-delay-1 border-y border-[var(--mt-line)] py-8">
        <p className="text-[var(--mt-muted)]">
          Włącz obszary w{" "}
          <Link
            href="/settings"
            className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
          >
            ustawieniach
          </Link>
          , żeby zbudować swój pulpit.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-rise mt-rise-delay-1">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          To, co MamTo pilnuje.
        </h2>
      </div>

      <div className="mt-8 grid gap-0 border-y border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-3">
        {visible.map((domain, index) => (
          <Link
            key={domain.key}
            href={isLoading ? "#" : domain.href}
            className={`group relative px-0 py-7 transition md:px-5 md:first:pl-0 ${
              index < visible.length - 1
                ? "border-b border-[var(--mt-line)] md:border-b-0 md:border-r"
                : "border-b border-[var(--mt-line)] md:border-b-0"
            } ${
              visible.length > 1 && index === visible.length - 2
                ? "md:[&:nth-last-child(2)]:border-r xl:border-r"
                : ""
            }`}
            style={{animationDelay: `${0.08 + index * 0.06}s`}}
          >
            <NavIcon id={domain.icon} className="mt-domain-icon" />
            <h3 className="font-display mt-5 text-2xl tracking-tight transition duration-300 group-hover:text-[var(--mt-accent)]">
              {domain.title}
            </h3>
            <p className="mt-3 max-w-[15.5rem] text-sm leading-relaxed text-[var(--mt-muted)]">
              {domain.line}
            </p>
            <span className="mt-4 inline-flex text-xs text-[var(--mt-muted)] transition duration-300 group-hover:translate-x-1 group-hover:text-[var(--mt-accent)]">
              Wejdź →
            </span>
            <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--mt-accent)] transition duration-400 group-hover:scale-x-100" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LifeDomains;

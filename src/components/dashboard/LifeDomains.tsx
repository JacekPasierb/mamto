"use client";

import Link from "next/link";
import {useSettings, type Modules} from "@/context/SettingsContext";

const domains: {
  key: keyof Modules;
  href: string;
  index: string;
  title: string;
  line: string;
}[] = [
  {
    key: "vehicles",
    href: "/vehicles",
    index: "02",
    title: "Pojazdy",
    line: "Przeglądy, olej, opony — zanim zapomnisz.",
  },
  {
    key: "insurance",
    href: "/insurance",
    index: "03",
    title: "Ubezpieczenia",
    line: "OC, dom, mieszkanie — daty pod kontrolą.",
  },
  {
    key: "stock",
    href: "/stock",
    index: "05",
    title: "Zapasy",
    line: "Leki i rzeczy, których nie może zabraknąć.",
  },
  {
    key: "beauty",
    href: "/beauty",
    index: "04",
    title: "Wizyty",
    line: "Fryzjer, kosmetyczka i inne terminy.",
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
          Włącz moduły w{" "}
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
        <div>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-muted)]">
            Mapa życia
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">
            Cztery obszary. Zero chaosu.
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-0 border-y border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-4">
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
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-xs text-[var(--mt-accent)]">
                {domain.index}
              </span>
              <span className="translate-x-0 text-xs text-[var(--mt-muted)] transition duration-300 group-hover:translate-x-1 group-hover:text-[var(--mt-accent)]">
                Wejdź →
              </span>
            </div>
            <h3 className="font-display mt-5 text-2xl tracking-tight transition duration-300 group-hover:text-[var(--mt-accent)]">
              {domain.title}
            </h3>
            <p className="mt-3 max-w-[15.5rem] text-sm leading-relaxed text-[var(--mt-muted)]">
              {domain.line}
            </p>
            <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--mt-accent)] transition duration-400 group-hover:scale-x-100" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LifeDomains;

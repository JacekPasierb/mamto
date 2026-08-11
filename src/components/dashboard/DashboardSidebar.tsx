"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {UserButton} from "@clerk/nextjs";
import {useSettings, type Modules} from "@/context/SettingsContext";
import MamToLogo from "@/components/brand/MamToLogo";

type NavLink = {
  href: string;
  label: string;
  index: string;
  hint: string;
  moduleKey?: keyof Modules;
};

const links: NavLink[] = [
  {
    href: "/dashboard",
    label: "Pulpit",
    index: "01",
    hint: "Całe życie w skrócie",
  },
  {
    href: "/vehicles",
    label: "Pojazdy",
    index: "02",
    hint: "Olej, opony, przegląd",
    moduleKey: "vehicles",
  },
  {
    href: "/insurance",
    label: "Ubezpieczenia",
    index: "03",
    hint: "Auto, dom, terminy",
    moduleKey: "insurance",
  },
  {
    href: "/beauty",
    label: "Wizyty",
    index: "04",
    hint: "Fryzjer i pielęgnacja",
    moduleKey: "beauty",
  },
  {
    href: "/stock",
    label: "Zapasy",
    index: "05",
    hint: "Leki zanim się skończą",
    moduleKey: "stock",
  },
  {
    href: "/settings",
    label: "Ustawienia",
    index: "06",
    hint: "Moduły i preferencje",
  },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const {modules, isLoading} = useSettings();

  const visibleLinks = links.filter((link) => {
    if (!link.moduleKey) return true;
    if (isLoading) return false;
    return Boolean(modules?.[link.moduleKey]);
  });

  return (
    <>
      <div className="mt-rail sticky top-0 z-20 border-b border-[var(--mt-line)] lg:hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/dashboard" aria-label="MamTo">
            <MamToLogo className="[&_svg]:h-8 [&_svg]:w-8 [&_span]:text-xl" />
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-sm",
              },
            }}
          />
        </div>
        <nav className="flex gap-0 overflow-x-auto px-2 pb-3">
          {!isLoading &&
            visibleLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative shrink-0 px-3 py-2 text-sm transition ${
                    isActive
                      ? "font-medium text-[var(--mt-ink)]"
                      : "text-[var(--mt-muted)]"
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--mt-accent)]" />
                  ) : null}
                </Link>
              );
            })}
        </nav>
      </div>

      <aside className="mt-rail sticky top-0 hidden h-screen w-[17.5rem] shrink-0 flex-col border-r border-[var(--mt-line)] px-6 py-8 lg:flex">
        <Link href="/dashboard" className="group block" aria-label="MamTo">
          <div className="mt-brand-sheen">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-[var(--mt-muted)]">
              Organizer życia
            </p>
            <div className="mt-4 transition duration-300 group-hover:translate-x-0.5">
              <MamToLogo />
            </div>
          </div>
          <p className="mt-4 max-w-[12rem] text-[0.8rem] leading-relaxed text-[var(--mt-muted)]">
            Pojazdy, polisy, leki i wizyty — zanim wypadną z głowy.
          </p>
        </Link>

        <nav className="mt-12 flex flex-1 flex-col gap-1">
          <p className="mb-3 px-3 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Nawigacja
          </p>

          {isLoading && (
            <p className="px-3 text-sm text-[var(--mt-muted)]">Ładowanie…</p>
          )}

          {!isLoading &&
            visibleLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive}
                  className={`mt-nav-link group flex items-start gap-3 px-3 py-3 transition ${
                    isActive
                      ? "text-[var(--mt-ink)]"
                      : "text-[var(--mt-muted)] hover:text-[var(--mt-ink)]"
                  }`}
                >
                  <span className="font-display mt-0.5 w-5 text-[0.68rem] tabular-nums text-[var(--mt-accent)]">
                    {link.index}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.98rem] leading-none">
                      {link.label}
                    </span>
                    <span className="mt-1.5 block text-[0.72rem] leading-snug text-[var(--mt-muted)]">
                      {link.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
        </nav>

        <div className="mt-auto border-t border-[var(--mt-line)] pt-5">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-sm",
                },
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Twoje konto</p>
              <p className="truncate text-xs text-[var(--mt-muted)]">
                Sesja zabezpieczona
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;

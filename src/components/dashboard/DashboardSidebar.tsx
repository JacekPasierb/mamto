"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {UserButton} from "@clerk/nextjs";
import {useSettings, type Modules} from "@/context/SettingsContext";
import MamToLogo from "@/components/brand/MamToLogo";
import {NavIcon, type NavIconId} from "@/components/icons/NavIcons";

type NavLink = {
  href: string;
  label: string;
  hint: string;
  icon: NavIconId;
  moduleKey?: keyof Modules;
};

const links: NavLink[] = [
  {
    href: "/dashboard",
    label: "Pulpit",
    hint: "Całe życie w skrócie",
    icon: "dashboard",
  },
  {
    href: "/vehicles",
    label: "Pojazdy",
    hint: "Olej, opony, przegląd",
    icon: "vehicles",
    moduleKey: "vehicles",
  },
  {
    href: "/insurance",
    label: "Ubezpieczenia",
    hint: "Auto, dom, terminy",
    icon: "insurance",
    moduleKey: "insurance",
  },
  {
    href: "/documents",
    label: "Dokumenty osobiste",
    hint: "Ważność dokumentów",
    icon: "documents",
    moduleKey: "documents",
  },
  {
    href: "/visits",
    label: "Wizyty",
    hint: "Lekarze, uroda, fryzjer",
    icon: "visits",
    moduleKey: "beauty",
  },
  {
    href: "/stock",
    label: "Zapasy",
    hint: "Leki zanim się skończą",
    icon: "stock",
    moduleKey: "stock",
  },
  {
    href: "/settings",
    label: "Ustawienia",
    hint: "Preferencje konta",
    icon: "settings",
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
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
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
                  className={`mt-nav-chip relative flex shrink-0 flex-col items-center gap-1.5 px-3 py-2 text-[0.7rem] transition ${
                    isActive
                      ? "font-medium text-[var(--mt-ink)]"
                      : "text-[var(--mt-muted)]"
                  }`}
                >
                  <NavIcon id={link.icon} active={isActive} />
                  <span className="max-w-[4.5rem] truncate text-center">
                    {link.label === "Dokumenty osobiste"
                      ? "Dokumenty"
                      : link.label}
                  </span>
                  {isActive ? (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--mt-accent)]" />
                  ) : null}
                </Link>
              );
            })}
        </nav>
      </div>

      <aside className="mt-rail sticky top-0 hidden h-dvh max-h-dvh w-[17.5rem] shrink-0 flex-col overflow-hidden border-r border-[var(--mt-line)] lg:flex">
        <div className="shrink-0 px-6 pb-4 pt-6">
          <Link href="/dashboard" className="group block" aria-label="MamTo">
            <div className="mt-brand-sheen">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-[var(--mt-muted)]">
                Organizer życia
              </p>
              <div className="mt-3 transition duration-300 group-hover:translate-x-0.5">
                <MamToLogo />
              </div>
            </div>
            <p className="mt-3 max-w-[12rem] text-[0.75rem] leading-relaxed text-[var(--mt-muted)]">
              Pojazdy, polisy, dokumenty, leki i wizyty — zanim wypadną z głowy.
            </p>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
          <p className="mb-2 px-3 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
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
                  className={`mt-nav-link group flex items-start gap-3 px-3 py-2.5 transition ${
                    isActive
                      ? "text-[var(--mt-ink)]"
                      : "text-[var(--mt-muted)] hover:text-[var(--mt-ink)]"
                  }`}
                >
                  <span className="mt-0.5 flex w-7 shrink-0 justify-center">
                    <NavIcon id={link.icon} active={isActive} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.95rem] leading-none">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-[0.7rem] leading-snug text-[var(--mt-muted)]">
                      {link.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
        </nav>

        <div className="shrink-0 border-t border-[var(--mt-line)] px-6 py-4">
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

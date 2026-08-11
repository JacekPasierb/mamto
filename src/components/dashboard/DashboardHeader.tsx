"use client";

import MamToLogo from "@/components/brand/MamToLogo";
import {useUser} from "@clerk/nextjs";

const DashboardHeader = () => {
  const {user} = useUser();

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Dzień dobry" : hour < 18 ? "Cześć" : "Dobry wieczór";

  return (
    <header className="mt-rise relative overflow-hidden border-b border-[var(--mt-line)] pb-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full border border-[var(--mt-accent)]/15" />
      <div className="pointer-events-none absolute -top-10 right-28 h-28 w-28 rounded-full border border-[var(--mt-ink)]/8" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <MamToLogo showWordmark={false} className="[&_svg]:h-10 [&_svg]:w-10" />
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-accent)]">
                MamTo · {dateLabel}
              </p>
              <p className="font-display mt-1 text-sm tracking-tight text-[var(--mt-muted)]">
                Organizer człowieka
              </p>
            </div>
          </div>

          <h1 className="font-display mt-7 text-4xl leading-[1.02] tracking-tight text-[var(--mt-ink)] sm:text-5xl lg:text-[3.35rem]">
            {greeting}
            {user?.firstName ? `, ${user.firstName}` : ""}
            <span className="mt-2 block text-[1.35rem] font-normal tracking-normal text-[var(--mt-muted)] sm:text-[1.5rem]">
              Wszystko, o czym musisz pamiętać — w jednym spokojnym miejscu.
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-5 lg:pb-1">
          <div className="text-left lg:text-right">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--mt-muted)]">
              Status dnia
            </p>
            <p className="font-display mt-1 text-lg tracking-tight text-[var(--mt-ink)]">
              Pod kontrolą
            </p>
          </div>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--mt-accent)]"
            style={{animation: "mt-pulse-soft 2.4s ease-in-out infinite"}}
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

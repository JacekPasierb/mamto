"use client";

import {useEffect, useId, useRef, useState} from "react";
import Link from "next/link";
import MamToLogo from "@/components/brand/MamToLogo";
import {useUser} from "@clerk/nextjs";

export type DayStatusItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  reason: string;
};

type DayStatus = {
  overdueCount: number;
  attentionCount: number;
  overdueItems?: DayStatusItem[];
  isLoading?: boolean;
};

type DashboardHeaderProps = {
  dayStatus?: DayStatus;
};

const DashboardHeader = ({dayStatus}: DashboardHeaderProps) => {
  const {user} = useUser();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Dzień dobry" : hour < 18 ? "Cześć" : "Dobry wieczór";

  const overdueCount = dayStatus?.overdueCount ?? 0;
  const attentionCount = dayStatus?.attentionCount ?? 0;
  const overdueItems = dayStatus?.overdueItems ?? [];
  const isLoading = dayStatus?.isLoading;
  const canOpenPanel = !isLoading && overdueCount > 0 && overdueItems.length > 0;

  useEffect(() => {
    if (!canOpenPanel) {
      setIsOpen(false);
    }
  }, [canOpenPanel]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  let statusLabel = "Pod kontrolą";
  let statusDetail = "Nic nie wymaga pilnej uwagi";
  let statusColor = "var(--mt-accent)";

  if (!isLoading) {
    if (overdueCount > 0) {
      statusLabel =
        overdueCount === 1
          ? "1 rzecz po terminie"
          : `${overdueCount} rzeczy po terminie`;
      statusDetail = canOpenPanel
        ? isOpen
          ? "Kliknij, aby zamknąć"
          : "Kliknij, aby zobaczyć listę"
        : "Wymaga Twojej uwagi";
      statusColor = "var(--mt-signal)";
    } else if (attentionCount > 0) {
      statusLabel =
        attentionCount === 1
          ? "1 rzecz do pilnowania"
          : `${attentionCount} rzeczy do pilnowania`;
      statusDetail = "Zbliżają się terminy";
      statusColor = "var(--mt-signal)";
    }
  }

  const statusBlock = (
    <>
      <div className="text-left lg:text-right">
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--mt-muted)]">
          Status dnia
        </p>
        <p
          className="font-display mt-1 text-lg tracking-tight"
          style={{
            color:
              overdueCount > 0 || attentionCount > 0
                ? statusColor
                : "var(--mt-ink)",
          }}
        >
          {isLoading ? "Sprawdzam…" : statusLabel}
        </p>
        {!isLoading ? (
          <p className="mt-1 text-xs text-[var(--mt-muted)]">{statusDetail}</p>
        ) : null}
      </div>

      {overdueCount > 0 || attentionCount > 0 ? (
        <span
          className="relative flex h-8 w-8 shrink-0 items-center justify-center"
          aria-hidden
        >
          <span
            className="absolute inset-0 rounded-sm opacity-25"
            style={{
              background: statusColor,
              animation: "mt-pulse-soft 2.4s ease-in-out infinite",
            }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{color: statusColor}}
          >
            <path
              d="M12 3.5 21 19H3L12 3.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M12 10v4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
          {canOpenPanel ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-sm bg-[var(--mt-signal)]" />
          ) : null}
        </span>
      ) : (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--mt-accent)]"
          style={{animation: "mt-pulse-soft 2.4s ease-in-out infinite"}}
          aria-hidden
        />
      )}
    </>
  );

  return (
    <header className="mt-rise relative z-30 overflow-visible border-b border-[var(--mt-line)] pb-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full border border-[var(--mt-accent)]/15" />
      <div className="pointer-events-none absolute -top-10 right-28 h-28 w-28 rounded-full border border-[var(--mt-ink)]/8" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <MamToLogo
              showWordmark={false}
              className="[&_svg]:h-10 [&_svg]:w-10"
            />
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

        <div className="relative self-start lg:self-end lg:pb-1">
          {canOpenPanel ? (
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-controls={titleId}
              onClick={() => setIsOpen((open) => !open)}
              className={`flex items-center justify-start gap-5 text-left transition hover:opacity-90 lg:justify-end ${
                isOpen ? "opacity-100" : ""
              }`}
            >
              {statusBlock}
            </button>
          ) : (
            <div className="flex items-center justify-start gap-5 lg:justify-end">
              {statusBlock}
            </div>
          )}

          {isOpen && canOpenPanel ? (
            <div
              ref={panelRef}
              role="dialog"
              aria-labelledby={titleId}
              className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-[var(--mt-line)] bg-white shadow-[0_12px_40px_rgba(20,36,44,0.14)] lg:left-auto lg:right-0"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--mt-line)] px-4 py-3">
                <div>
                  <p
                    id={titleId}
                    className="font-display text-base tracking-tight"
                  >
                    Powiadomienia
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--mt-muted)]">
                    Rzeczy po terminie
                  </p>
                </div>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--mt-signal)]">
                  {overdueCount}
                </span>
              </div>

              <ul className="max-h-[min(22rem,55vh)] overflow-y-auto">
                {overdueItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-3 border-b border-[var(--mt-line)] px-4 py-3.5 transition last:border-b-0 hover:bg-[var(--mt-bg)]"
                    >
                      <span
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--mt-signal)]/10"
                        aria-hidden
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[var(--mt-signal)]"
                        >
                          <path
                            d="M12 3.5 21 19H3L12 3.5Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 10v4.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <circle cx="12" cy="17" r="1" fill="currentColor" />
                        </svg>
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-snug text-[var(--mt-ink)]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--mt-muted)]">
                          {item.subtitle}
                        </span>
                        <span className="mt-1.5 block text-xs font-medium text-[var(--mt-signal)]">
                          {item.reason}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

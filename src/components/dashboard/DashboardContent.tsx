"use client";

import {useEffect, useState} from "react";

import AppShell from "./AppShell";
import DashboardHeader from "./DashboardHeader";
import LifeDomains from "./LifeDomains";
import QuickAddCard from "./QuickAddCard";
import ReminderSection, {type ReminderListItem} from "./ReminderSection";

type RemindersResponse = {
  urgent: ReminderListItem[];
  upcoming: ReminderListItem[];
  stock: ReminderListItem[];
};

const DashboardContent = () => {
  const [reminders, setReminders] = useState<RemindersResponse>({
    urgent: [],
    upcoming: [],
    stock: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/reminders");

        if (!response.ok) {
          throw new Error("Nie udało się pobrać przypomnień");
        }

        const data = await response.json();

        if (!cancelled) {
          setReminders({
            urgent: data.urgent || [],
            upcoming: data.upcoming || [],
            stock: data.stock || [],
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
        <DashboardHeader />

        <div className="mt-12">
          <LifeDomains />
        </div>

        <QuickAddCard onAddClick={() => {}} />

        <div className="mt-rise mt-rise-delay-3 mt-12">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-muted)]">
            Uwaga dnia
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">
            Co wymaga Twojego ruchu
          </h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <ReminderSection
              title="Pilne"
              description="Rzeczy, którymi warto zająć się teraz."
              emptyText="Brak pilnych spraw. Oddychaj spokojnie."
              tone="signal"
              items={reminders.urgent}
              isLoading={isLoading}
            />

            <ReminderSection
              title="Nadchodzące"
              description="Najbliższe terminy i przypomnienia."
              emptyText="Kalendarz jest czysty."
              tone="default"
              items={reminders.upcoming}
              isLoading={isLoading}
            />

            <ReminderSection
              title="Stany"
              description="Rzeczy, które niedługo mogą się skończyć."
              emptyText="Zapasy wyglądają dobrze."
              tone="ok"
              items={reminders.stock}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardContent;

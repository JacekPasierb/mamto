"use client";

import {useCallback, useEffect, useState} from "react";

import RefillStockModal from "@/components/stock/RefillStockModal";

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
  const [refillItem, setRefillItem] = useState<ReminderListItem | null>(null);

  const loadReminders = useCallback(async () => {
    const response = await fetch("/api/reminders", {cache: "no-store"});

    if (!response.ok) {
      throw new Error("Nie udało się pobrać przypomnień");
    }

    const data = await response.json();

    setReminders({
      urgent: data.urgent || [],
      upcoming: data.upcoming || [],
      stock: data.stock || [],
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await loadReminders();
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
  }, [loadReminders]);

  const handleRefill = (item: ReminderListItem) => {
    setRefillItem(item);
  };

  const handleRefilled = async () => {
    setRefillItem(null);

    try {
      await loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

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
              onRefill={handleRefill}
            />
          </div>
        </div>
      </div>

      {refillItem?.refill ? (
        <RefillStockModal
          isOpen={Boolean(refillItem)}
          itemId={refillItem.id}
          itemName={refillItem.title}
          usageMode={refillItem.refill.usageMode}
          unit={refillItem.refill.unit}
          currentStock={refillItem.refill.currentStock}
          onClose={() => setRefillItem(null)}
          onRefilled={handleRefilled}
        />
      ) : null}
    </AppShell>
  );
};

export default DashboardContent;

"use client";

import {useCallback, useEffect, useState} from "react";

import RefillStockModal from "@/components/stock/RefillStockModal";

import AppShell from "./AppShell";
import DashboardHeader from "./DashboardHeader";
import LifeDomains from "./LifeDomains";
import QuickAddCard from "./QuickAddCard";
import QuickAddModal from "./QuickAddModal";
import ReminderSection, {type ReminderListItem} from "./ReminderSection";
import {IconActionField} from "@/components/icons/AttentionIcons";

type RemindersResponse = {
  urgent: ReminderListItem[];
  upcoming: ReminderListItem[];
  stock: ReminderListItem[];
  summary: {
    overdueCount: number;
    attentionCount: number;
    upcomingCount: number;
  };
};

const emptyReminders: RemindersResponse = {
  urgent: [],
  upcoming: [],
  stock: [],
  summary: {
    overdueCount: 0,
    attentionCount: 0,
    upcomingCount: 0,
  },
};

const DashboardContent = () => {
  const [reminders, setReminders] = useState<RemindersResponse>(emptyReminders);
  const [isLoading, setIsLoading] = useState(true);
  const [refillItem, setRefillItem] = useState<ReminderListItem | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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
      summary: data.summary || emptyReminders.summary,
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

  const handleQuickSaved = async () => {
    try {
      await loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

  const overdueItems = [
    ...reminders.urgent.filter((item) => item.overdue),
    ...reminders.stock.filter((item) => item.overdue),
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
        <DashboardHeader
          dayStatus={{
            overdueCount: reminders.summary.overdueCount,
            attentionCount: reminders.summary.attentionCount,
            overdueItems,
            isLoading,
          }}
        />

        <div className="mt-12">
          <LifeDomains />
        </div>

        <QuickAddCard onAddClick={() => setIsQuickAddOpen(true)} />

        <div className="mt-rise mt-rise-delay-3 mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              <span
                className="mt-attention-mark"
                style={{color: "var(--mt-accent)"}}
              >
                <IconActionField />
              </span>
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-muted)]">
                  Uwaga dnia
                </p>
                <h2 className="font-display mt-2 text-2xl tracking-tight">
                  Co wymaga Twojego ruchu
                </h2>
              </div>
            </div>

            {!isLoading && reminders.summary.overdueCount > 0 ? (
              <p className="text-sm font-medium text-[var(--mt-signal)]">
                Są sprawy po terminie
              </p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <ReminderSection
              title="Pilne"
              description="Rzeczy, którymi warto zająć się teraz."
              emptyText="Brak pilnych spraw. Oddychaj spokojnie."
              tone="signal"
              icon="urgent"
              items={reminders.urgent}
              isLoading={isLoading}
            />

            <ReminderSection
              title="Nadchodzące"
              description="Najbliższe terminy i przypomnienia."
              emptyText="Kalendarz jest czysty."
              tone="default"
              icon="upcoming"
              items={reminders.upcoming}
              isLoading={isLoading}
            />

            <ReminderSection
              title="Stany"
              description="Rzeczy, które niedługo mogą się skończyć."
              emptyText="Zapasy wyglądają dobrze."
              tone="ok"
              icon="levels"
              items={reminders.stock}
              isLoading={isLoading}
              onRefill={handleRefill}
            />
          </div>
        </div>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaved={handleQuickSaved}
      />

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

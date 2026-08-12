import {
  calculateCurrentStock,
  estimateDaysRemaining,
  isStockUrgent,
  todayCalendarDate,
} from "@/lib/calculateCurrentStock";
import type {UsageMode} from "@/lib/stockTypes";

export type StockRecord = {
  _id?: unknown;
  usageMode?: UsageMode;
  quantity?: number;
  minQuantity?: number;
  stock?: number | null;
  stockDate?: Date | string | null;
  dailyUsage?: number | null;
  reminderThreshold?: number | null;
};

export type EnrichedStockItem = StockRecord & {
  currentStock: number;
  daysRemaining: number | null;
  isUrgent: boolean;
  usageMode: UsageMode;
};

function isDailyStock(item: StockRecord): boolean {
  if (item.usageMode === "daily") {
    return true;
  }

  return (
    item.stock != null &&
    item.stockDate != null &&
    item.dailyUsage != null &&
    Number(item.dailyUsage) > 0
  );
}

export function enrichStockItem(
  item: StockRecord,
  asOf: Date = todayCalendarDate()
): EnrichedStockItem {
  if (isDailyStock(item)) {
    const stock = Number(item.stock) || 0;
    const dailyUsage = Number(item.dailyUsage) || 0;
    const reminderThreshold = Number(item.reminderThreshold) || 0;
    const stockDate = item.stockDate ?? asOf;

    const currentStock = calculateCurrentStock({
      stock,
      stockDate,
      dailyUsage,
      asOf,
    });

    return {
      ...item,
      usageMode: "daily",
      currentStock,
      daysRemaining: estimateDaysRemaining(currentStock, dailyUsage),
      isUrgent: isStockUrgent(currentStock, reminderThreshold),
    };
  }

  const currentStock = Number(item.quantity) || 0;
  const minQuantity = Number(item.minQuantity) || 0;

  return {
    ...item,
    usageMode: item.usageMode ?? "static",
    currentStock,
    daysRemaining: null,
    isUrgent: isStockUrgent(currentStock, minQuantity),
  };
}

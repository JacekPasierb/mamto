/** Data kalendarzowa w lokalnej strefie — bez przesunięć UTC. */
export function parseCalendarDate(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);

  if (year && month && day) {
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(value);
  return new Date(
    fallback.getFullYear(),
    fallback.getMonth(),
    fallback.getDate()
  );
}

export function todayCalendarDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function countFullDaysBetween(
  from: Date | string,
  to: Date | string
): number {
  const fromDay = parseCalendarDate(from).getTime();
  const toDay = parseCalendarDate(to).getTime();
  const diffMs = toDay - fromDay;

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

type CalculateCurrentStockInput = {
  stock: number;
  stockDate: Date | string;
  dailyUsage: number;
  asOf?: Date;
};

export function calculateCurrentStock({
  stock,
  stockDate,
  dailyUsage,
  asOf = todayCalendarDate(),
}: CalculateCurrentStockInput): number {
  const fullDays = countFullDaysBetween(stockDate, asOf);
  const consumed = fullDays * dailyUsage;

  return Math.max(0, stock - consumed);
}

export function estimateDaysRemaining(
  currentStock: number,
  dailyUsage: number
): number | null {
  if (dailyUsage <= 0) {
    return null;
  }

  return Math.floor(currentStock / dailyUsage);
}

export function isStockUrgent(
  currentStock: number,
  reminderThreshold: number
): boolean {
  return currentStock <= reminderThreshold;
}

export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";

  const date = parseCalendarDate(
    typeof value === "string" ? value : value.toISOString()
  );

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

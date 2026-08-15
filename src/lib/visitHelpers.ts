import {
  parseCalendarDate,
  todayCalendarDate,
} from "@/lib/calculateCurrentStock";
import {VISIT_URGENT_DAYS, type VisitType} from "@/lib/visitTypes";

export type VisitRecord = {
  _id?: unknown;
  name: string;
  type: VisitType;
  providerName?: string;
  lastVisitAt?: Date | string | null;
  nextDueAt: Date | string;
  intervalMonths?: number | null;
  notes?: string;
};

export type EnrichedVisit = VisitRecord & {
  daysUntilDue: number;
  isOverdue: boolean;
  isUrgent: boolean;
};

export function daysUntilDue(
  nextDueAt: Date | string,
  asOf: Date = todayCalendarDate()
): number {
  const end = parseCalendarDate(nextDueAt);
  const start = parseCalendarDate(asOf);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function enrichVisit(
  item: VisitRecord,
  asOf: Date = todayCalendarDate()
): EnrichedVisit {
  const days = daysUntilDue(item.nextDueAt, asOf);

  return {
    ...item,
    daysUntilDue: days,
    isOverdue: days < 0,
    isUrgent: days <= VISIT_URGENT_DAYS,
  };
}

/** Przesuwa datę o N miesięcy kalendarzowych. */
export function addMonths(base: Date | string, months: number): Date {
  const date = parseCalendarDate(base);
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);

  // Korekta końca miesiąca (np. 31 → lutego)
  if (result.getDate() < day) {
    result.setDate(0);
  }

  return result;
}

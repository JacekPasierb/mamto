import {
  parseCalendarDate,
  todayCalendarDate,
} from "@/lib/calculateCurrentStock";
import {
  PET_CARE_URGENT_DAYS,
  type InfectiousDisease,
  type PetCareType,
} from "@/lib/petTypes";

export type PetCareRecord = {
  _id?: unknown;
  petId?: unknown;
  name: string;
  type: PetCareType;
  diseases?: InfectiousDisease[];
  providerName?: string;
  lastDoneAt?: Date | string | null;
  nextDueAt?: Date | string | null;
  intervalMonths?: number | null;
  notes?: string;
  reminderDismissed?: boolean;
};

export type EnrichedPetCare = PetCareRecord & {
  daysUntilDue: number | null;
  isOverdue: boolean;
  isUrgent: boolean;
  isActive: boolean;
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

export function enrichPetCare(
  item: PetCareRecord,
  asOf: Date = todayCalendarDate()
): EnrichedPetCare {
  if (!item.nextDueAt) {
    return {
      ...item,
      daysUntilDue: null,
      isOverdue: false,
      isUrgent: false,
      isActive: false,
    };
  }

  const days = daysUntilDue(item.nextDueAt, asOf);
  const dismissed = Boolean(item.reminderDismissed);

  return {
    ...item,
    daysUntilDue: days,
    // Badge „Po terminie” / pilne — wyłączone po „Oznacz wykonane”.
    isOverdue: !dismissed && days < 0,
    isUrgent: !dismissed && days <= PET_CARE_URGENT_DAYS,
    isActive: true,
  };
}

/** Przesuwa datę o N miesięcy kalendarzowych. */
export function addMonths(base: Date | string, months: number): Date {
  const date = parseCalendarDate(base);
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);

  if (result.getDate() < day) {
    result.setDate(0);
  }

  return result;
}

import {
  SERVICE_INTERVALS,
  type ServiceType,
} from "@/lib/serviceTypes";

export function addMonthsToDateInput(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const next = new Date(year, month - 1, day);
  next.setMonth(next.getMonth() + months);

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function addYearsToDateInput(dateStr: string, years: number): string {
  return addMonthsToDateInput(dateStr, years * 12);
}

function toDateInputString(value: string | Date): string {
  if (typeof value === "string") {
    return value.split("T")[0];
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultNextDueAtInput(
  type: ServiceType,
  performedAt: string
): string {
  const interval = SERVICE_INTERVALS[type];

  if (!interval?.months) {
    return "";
  }

  return addMonthsToDateInput(performedAt, interval.months);
}

export function getDefaultNextDueMileage(
  type: ServiceType,
  mileage: number
): number | null {
  const interval = SERVICE_INTERVALS[type];

  if (!interval?.km || mileage <= 0) {
    return null;
  }

  return mileage + interval.km;
}

export function resolveNextDueAt(
  type: ServiceType,
  performedAt: string | Date,
  nextDueAt?: string | null
): Date | null {
  if (nextDueAt) {
    return new Date(nextDueAt);
  }

  const dateStr = toDateInputString(performedAt);
  const nextDateStr = getDefaultNextDueAtInput(type, dateStr);

  if (!nextDateStr) {
    return null;
  }

  const [year, month, day] = nextDateStr.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function resolveNextDueMileage(
  type: ServiceType,
  mileage: number,
  nextDueMileage?: string | number | null
): number | null {
  if (nextDueMileage !== "" && nextDueMileage != null) {
    return Number(nextDueMileage);
  }

  return getDefaultNextDueMileage(type, mileage);
}

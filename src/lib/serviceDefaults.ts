import type {ServiceType} from "@/lib/serviceTypes";

export function addYearsToDateInput(dateStr: string, years: number): string {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const next = new Date(year, month - 1, day);
  next.setFullYear(next.getFullYear() + years);

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function resolveNextDueAt(
  type: ServiceType,
  performedAt: string | Date,
  nextDueAt?: string | null
): Date | null {
  if (nextDueAt) {
    return new Date(nextDueAt);
  }

  if (type !== "inspection") {
    return null;
  }

  const dateStr =
    typeof performedAt === "string"
      ? performedAt.split("T")[0]
      : `${performedAt.getFullYear()}-${String(performedAt.getMonth() + 1).padStart(2, "0")}-${String(performedAt.getDate()).padStart(2, "0")}`;

  const nextDateStr = addYearsToDateInput(dateStr, 1);

  if (!nextDateStr) {
    return null;
  }

  const [year, month, day] = nextDateStr.split("-").map(Number);

  return new Date(year, month - 1, day);
}

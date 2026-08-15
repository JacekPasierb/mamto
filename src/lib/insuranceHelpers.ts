import {
  parseCalendarDate,
  todayCalendarDate,
} from "@/lib/calculateCurrentStock";
import {
  INSURANCE_URGENT_DAYS,
  type InsurancePaymentFrequency,
  type InsuranceType,
} from "@/lib/insuranceTypes";

export type InsuranceRecord = {
  _id?: unknown;
  name: string;
  type: InsuranceType;
  insurer?: string;
  policyNumber?: string;
  startsAt?: Date | string | null;
  endsAt: Date | string;
  premium?: number | null;
  paymentFrequency?: InsurancePaymentFrequency;
  vehicleId?: unknown;
  vehicleName?: string | null;
  notes?: string;
};

export type EnrichedInsurance = InsuranceRecord & {
  daysUntilEnd: number;
  isOverdue: boolean;
  isUrgent: boolean;
};

export function daysUntilEnd(
  endsAt: Date | string,
  asOf: Date = todayCalendarDate()
): number {
  const end = parseCalendarDate(endsAt);
  const start = parseCalendarDate(asOf);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function enrichInsurance(
  item: InsuranceRecord,
  asOf: Date = todayCalendarDate()
): EnrichedInsurance {
  const days = daysUntilEnd(item.endsAt, asOf);

  return {
    ...item,
    daysUntilEnd: days,
    isOverdue: days < 0,
    isUrgent: days <= INSURANCE_URGENT_DAYS,
  };
}

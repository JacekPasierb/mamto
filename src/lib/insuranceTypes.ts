export const INSURANCE_TYPES = [
  "vehicle",
  "property",
  "life",
  "health",
  "travel",
  "other",
  // Legacy (stare wpisy)
  "oc",
  "ac",
  "nnw",
  "home",
  "apartment",
] as const;

export type InsuranceType = (typeof INSURANCE_TYPES)[number];

/** Typy wybierane w formularzu. */
export const INSURANCE_FORM_TYPES = [
  "vehicle",
  "property",
  "life",
  "health",
  "travel",
  "other",
] as const;

export type InsuranceFormType = (typeof INSURANCE_FORM_TYPES)[number];

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  vehicle: "Pojazdy",
  property: "Nieruchomości",
  life: "Życie",
  health: "Zdrowie",
  travel: "Podróże",
  other: "Inne",
  oc: "Pojazdy",
  ac: "Pojazdy",
  nnw: "Pojazdy",
  home: "Nieruchomości",
  apartment: "Nieruchomości",
};

export function normalizeInsuranceType(type: InsuranceType): InsuranceFormType {
  if (type === "oc" || type === "ac" || type === "nnw") {
    return "vehicle";
  }

  if (type === "home" || type === "apartment") {
    return "property";
  }

  if (
    type === "vehicle" ||
    type === "property" ||
    type === "life" ||
    type === "health" ||
    type === "travel" ||
    type === "other"
  ) {
    return type;
  }

  return "other";
}

export function isVehicleInsurance(type: InsuranceType): boolean {
  return normalizeInsuranceType(type) === "vehicle";
}

export const INSURANCE_PAYMENT_FREQUENCIES = [
  "yearly",
  "monthly",
  "once",
] as const;

export type InsurancePaymentFrequency =
  (typeof INSURANCE_PAYMENT_FREQUENCIES)[number];

export const INSURANCE_PAYMENT_LABELS: Record<
  InsurancePaymentFrequency,
  string
> = {
  yearly: "Rocznie",
  monthly: "Miesięcznie",
  once: "Jednorazowo",
};

export const INSURANCE_URGENT_DAYS = 30;
export const INSURANCE_UPCOMING_DAYS = 60;

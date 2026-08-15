export const VISIT_TYPES = [
  "health",
  "dental",
  "beauty",
  "hair",
  "other",
  // Legacy
  "specialist",
] as const;

export type VisitType = (typeof VISIT_TYPES)[number];

/** Typy wybierane w formularzu. */
export const VISIT_FORM_TYPES = [
  "health",
  "dental",
  "beauty",
  "hair",
  "other",
] as const;

export type VisitFormType = (typeof VISIT_FORM_TYPES)[number];

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  health: "Zdrowie",
  dental: "Stomatologia",
  beauty: "Uroda",
  hair: "Fryzjer",
  other: "Inne",
  specialist: "Zdrowie",
};

export const VISIT_TYPE_HINTS: Record<VisitFormType, string> = {
  health: "Lekarz rodzinny, ginekolog, urolog, okulista, badania…",
  dental: "Dentysta, higienizacja, ortodonta",
  beauty: "Paznokcie, rzęsy, kosmetyczka, brwi",
  hair: "Fryzjer, barber, koloryzacja",
  other: "Fizjoterapia, masaż i inne wizyty",
};

/** Sugestie nazw przy wyborze kategorii. */
export const VISIT_NAME_SUGGESTIONS: Record<VisitFormType, string[]> = {
  health: [
    "Lekarz rodzinny",
    "Ginekolog",
    "Urolog",
    "Okulista",
    "Dermatolog",
    "Badania kontrolne",
  ],
  dental: ["Dentysta", "Higienizacja", "Kontrola stomatologiczna"],
  beauty: [
    "Manicure",
    "Pedicure",
    "Rzęsy",
    "Brwi",
    "Kosmetyczka",
    "Depilacja",
    "Makijaż permanentny",
  ],
  hair: ["Fryzjer", "Barber", "Strzyżenie", "Koloryzacja"],
  other: ["Fizjoterapia", "Masaż", "Inna wizyta"],
};

/** Domyślny odstęp w miesiącach dla systematycznych wizyt. */
export const VISIT_DEFAULT_INTERVAL_MONTHS: Record<VisitType, number> = {
  health: 12,
  dental: 6,
  beauty: 3,
  hair: 2,
  other: 6,
  specialist: 12,
};

export function normalizeVisitType(type: VisitType): VisitFormType {
  if (type === "specialist") {
    return "health";
  }

  if (
    type === "health" ||
    type === "dental" ||
    type === "beauty" ||
    type === "hair" ||
    type === "other"
  ) {
    return type;
  }

  return "other";
}

export const VISIT_URGENT_DAYS = 14;
export const VISIT_UPCOMING_DAYS = 45;

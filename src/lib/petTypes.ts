export const PET_SPECIES = ["dog", "cat", "other"] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: "Pies",
  cat: "Kot",
  other: "Inne",
};

export const PET_CARE_TYPES = [
  "rabies",
  "infectious",
  "deworming",
  "tick",
  "flea",
  "vet_checkup",
  "other",
] as const;

export type PetCareType = (typeof PET_CARE_TYPES)[number];

export const PET_CARE_FORM_TYPES = PET_CARE_TYPES;

export type PetCareFormType = PetCareType;

export const PET_CARE_TYPE_LABELS: Record<PetCareType, string> = {
  rabies: "Wścieklizna",
  infectious: "Choroby zakaźne",
  deworming: "Odrobaczanie",
  tick: "Kleszcze",
  flea: "Pchły",
  vet_checkup: "Kontrola u weta",
  other: "Inne",
};

export const PET_CARE_TYPE_HINTS: Record<PetCareType, string> = {
  rabies: "Szczepienie przeciw wściekliźnie",
  infectious: "Szczepienie przeciw chorobom zakaźnym",
  deworming: "Preparat odrobaczający",
  tick: "Tabletki / obroża / krople na kleszcze",
  flea: "Preparat przeciw pchłom",
  vet_checkup: "Badanie kontrolne, przegląd zdrowia",
  other: "Inna opieka lub zabieg",
};

export const PET_CARE_NAME_SUGGESTIONS: Record<PetCareType, string[]> = {
  rabies: ["Szczepienie przeciw wściekliźnie"],
  infectious: [
    "Szczepienie podstawowe",
    "Szczepienie przeciw chorobom zakaźnym",
  ],
  deworming: ["Odrobaczanie", "Tabletka odrobaczająca"],
  tick: ["Tabletka na kleszcze", "Obroża na kleszcze", "Krople na kleszcze"],
  flea: ["Preparat przeciw pchłom", "Krople przeciw pchłom"],
  vet_checkup: ["Kontrola u weterynarza", "Badania krwi"],
  other: ["Inny zabieg", "Pielęgnacja"],
};

export const PET_CARE_DEFAULT_INTERVAL_MONTHS: Record<PetCareType, number> = {
  rabies: 12,
  infectious: 12,
  deworming: 3,
  tick: 1,
  flea: 1,
  vet_checkup: 12,
  other: 6,
};

export function normalizePetCareType(type: string): PetCareType {
  if ((PET_CARE_TYPES as readonly string[]).includes(type)) {
    return type as PetCareType;
  }

  return "other";
}

export const PET_CARE_URGENT_DAYS = 14;
export const PET_CARE_UPCOMING_DAYS = 45;

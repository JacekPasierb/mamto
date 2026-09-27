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
  "flea_tick",
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
  flea_tick: "Pchły i kleszcze",
  vet_checkup: "Kontrola u weta",
  other: "Inne",
};

export const PET_CARE_TYPE_HINTS: Record<PetCareType, string> = {
  rabies: "Szczepienie przeciw wściekliźnie",
  infectious: "Szczepienie przeciw chorobom zakaźnym",
  deworming: "Preparat odrobaczający",
  tick: "Tabletki / obroża / krople tylko na kleszcze",
  flea: "Preparat tylko przeciw pchłom",
  flea_tick: "Jeden preparat na pchły i kleszcze (np. Vectra 3D)",
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
  flea_tick: [
    "Vectra 3D",
    "Tabletka na pchły i kleszcze",
    "Krople na pchły i kleszcze",
  ],
  vet_checkup: ["Kontrola u weterynarza", "Badania krwi"],
  other: ["Inny zabieg", "Pielęgnacja"],
};

export const PET_CARE_DEFAULT_INTERVAL_MONTHS: Record<PetCareType, number> = {
  rabies: 12,
  infectious: 12,
  deworming: 3,
  tick: 1,
  flea: 1,
  flea_tick: 1,
  vet_checkup: 12,
  other: 6,
};

/** Choroby w szczepieniu „choroby zakaźne”. */
export const INFECTIOUS_DISEASES = [
  "parvovirus",
  "distemper",
  "hepatitis",
  "leptospirosis",
  "coronavirus",
  "kennel_cough",
  "lyme",
] as const;

export type InfectiousDisease = (typeof INFECTIOUS_DISEASES)[number];

export const INFECTIOUS_DISEASE_LABELS: Record<InfectiousDisease, string> = {
  parvovirus: "Parwowiroza",
  distemper: "Nosówka",
  hepatitis: "Zakaźne zapalenie wątroby",
  leptospirosis: "Leptospiroza",
  coronavirus: "Koronawiroza",
  kennel_cough: "Kaszel kenelowy",
  lyme: "Borelioza",
};

/** Domyślnie zaznaczone przy nowym szczepieniu przeciw zakaźnym. */
export const INFECTIOUS_DISEASE_DEFAULTS: InfectiousDisease[] = [
  "parvovirus",
  "distemper",
  "hepatitis",
  "leptospirosis",
];

export function normalizePetCareType(type: string): PetCareType {
  if ((PET_CARE_TYPES as readonly string[]).includes(type)) {
    return type as PetCareType;
  }

  return "other";
}

export function normalizeInfectiousDiseases(
  value: unknown
): InfectiousDisease[] {
  if (!Array.isArray(value)) return [];

  const allowed = new Set<string>(INFECTIOUS_DISEASES);
  const seen = new Set<InfectiousDisease>();
  const result: InfectiousDisease[] = [];

  for (const entry of value) {
    if (typeof entry !== "string" || !allowed.has(entry)) continue;
    const disease = entry as InfectiousDisease;
    if (seen.has(disease)) continue;
    seen.add(disease);
    result.push(disease);
  }

  return result;
}

export function formatInfectiousDiseases(
  diseases: InfectiousDisease[] | null | undefined
): string {
  if (!diseases?.length) return "";
  return diseases.map((d) => INFECTIOUS_DISEASE_LABELS[d]).join(", ");
}

export const PET_CARE_URGENT_DAYS = 14;
export const PET_CARE_UPCOMING_DAYS = 45;

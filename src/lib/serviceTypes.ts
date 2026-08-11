export const SERVICE_TYPES = [
  "oil",
  "tires",
  "filters",
  "wipers",
  "inspection",
  "brakes",
  "other",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  oil: "Wymiana oleju",
  tires: "Opony",
  filters: "Filtry",
  wipers: "Wycieraczki",
  inspection: "Przegląd",
  brakes: "Hamulce",
  other: "Inne",
};

export const SERVICE_TAB_LABELS: Record<ServiceType, string> = {
  oil: "Olej",
  tires: "Opony",
  filters: "Filtry",
  wipers: "Wycieraczki",
  inspection: "Przegląd",
  brakes: "Hamulce",
  other: "Inne",
};

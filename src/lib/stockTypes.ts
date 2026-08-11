export const STOCK_CATEGORIES = [
  "medicine",
  "supplements",
  "lenses",
  "household",
  "other",
] as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[number];

export const STOCK_CATEGORY_LABELS: Record<StockCategory, string> = {
  medicine: "Leki",
  supplements: "Suplementy",
  lenses: "Soczewki",
  household: "Dom",
  other: "Inne",
};

export const STOCK_UNITS = [
  "szt.",
  "opak.",
  "blistrów",
  "tabletek",
  "ml",
  "g",
] as const;

export type StockUnit = (typeof STOCK_UNITS)[number];

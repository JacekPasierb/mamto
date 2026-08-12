export const PERFORMED_BY_OPTIONS = ["workshop", "self", "other"] as const;

export type PerformedBy = (typeof PERFORMED_BY_OPTIONS)[number];

export const PERFORMED_BY_LABELS: Record<PerformedBy, string> = {
  workshop: "Warsztat",
  self: "Wykonane samodzielnie",
  other: "Inne",
};

export function getServiceWorkshopDisplay(service: {
  performedBy?: PerformedBy | string | null;
  workshopName?: string | null;
}): {label: string; value: string} | null {
  const workshopName = service.workshopName?.trim();
  const performedBy = service.performedBy as PerformedBy | undefined;

  if (workshopName || performedBy === "workshop") {
    return {
      label: "Warsztat",
      value: workshopName || "—",
    };
  }

  if (performedBy === "self") {
    return {
      label: "Wykonane",
      value: PERFORMED_BY_LABELS.self,
    };
  }

  return null;
}

export const DOCUMENT_TYPES = [
  "identity",
  "travel",
  "licenses",
  "membership",
  "other",
  // Legacy
  "id_card",
  "passport",
  "driving_license",
  "student_id",
  "residence_card",
  "professional",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** Typy wybierane w formularzu. */
export const DOCUMENT_FORM_TYPES = [
  "identity",
  "travel",
  "licenses",
  "membership",
  "other",
] as const;

export type DocumentFormType = (typeof DOCUMENT_FORM_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identity: "Tożsamość",
  travel: "Podróże",
  licenses: "Uprawnienia",
  membership: "Legitymacje",
  other: "Inne",
  id_card: "Tożsamość",
  passport: "Podróże",
  driving_license: "Uprawnienia",
  student_id: "Legitymacje",
  residence_card: "Tożsamość",
  professional: "Uprawnienia",
};

export function normalizeDocumentType(type: DocumentType): DocumentFormType {
  if (type === "id_card" || type === "residence_card") {
    return "identity";
  }

  if (type === "passport") {
    return "travel";
  }

  if (type === "driving_license" || type === "professional") {
    return "licenses";
  }

  if (type === "student_id") {
    return "membership";
  }

  if (
    type === "identity" ||
    type === "travel" ||
    type === "licenses" ||
    type === "membership" ||
    type === "other"
  ) {
    return type;
  }

  return "other";
}

/** Pilne na dłużej niż polisy — wymiana dokumentów trwa. */
export const DOCUMENT_URGENT_DAYS = 60;
export const DOCUMENT_UPCOMING_DAYS = 90;

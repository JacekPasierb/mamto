import {
  parseCalendarDate,
  todayCalendarDate,
} from "@/lib/calculateCurrentStock";
import {
  DOCUMENT_URGENT_DAYS,
  type DocumentType,
} from "@/lib/documentTypes";

export type DocumentRecord = {
  _id?: unknown;
  name: string;
  type: DocumentType;
  documentNumber?: string;
  issuer?: string;
  issuedAt?: Date | string | null;
  expiresAt: Date | string;
  notes?: string;
};

export type EnrichedDocument = DocumentRecord & {
  daysUntilExpiry: number;
  isOverdue: boolean;
  isUrgent: boolean;
};

export function daysUntilExpiry(
  expiresAt: Date | string,
  asOf: Date = todayCalendarDate()
): number {
  const end = parseCalendarDate(expiresAt);
  const start = parseCalendarDate(asOf);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function enrichDocument(
  item: DocumentRecord,
  asOf: Date = todayCalendarDate()
): EnrichedDocument {
  const days = daysUntilExpiry(item.expiresAt, asOf);

  return {
    ...item,
    daysUntilExpiry: days,
    isOverdue: days < 0,
    isUrgent: days <= DOCUMENT_URGENT_DAYS,
  };
}

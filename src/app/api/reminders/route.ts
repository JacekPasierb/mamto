import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichDocument} from "@/lib/documentHelpers";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_UPCOMING_DAYS,
  DOCUMENT_URGENT_DAYS,
  normalizeDocumentType,
  type DocumentType,
} from "@/lib/documentTypes";
import {enrichInsurance} from "@/lib/insuranceHelpers";
import {
  INSURANCE_TYPE_LABELS,
  INSURANCE_UPCOMING_DAYS,
  INSURANCE_URGENT_DAYS,
  normalizeInsuranceType,
  type InsuranceType,
} from "@/lib/insuranceTypes";
import {SERVICE_TYPE_LABELS, getServiceInterval, type ServiceType, type VehicleKind} from "@/lib/serviceTypes";
import {enrichStockItem} from "@/lib/stockHelpers";
import {STOCK_CATEGORY_LABELS, type StockCategory} from "@/lib/stockTypes";
import {enrichVisit} from "@/lib/visitHelpers";
import {
  VISIT_TYPE_LABELS,
  VISIT_UPCOMING_DAYS,
  VISIT_URGENT_DAYS,
  normalizeVisitType,
  type VisitType,
} from "@/lib/visitTypes";
import InsurancePolicy from "@/models/InsurancePolicy";
import PersonalDocument from "@/models/PersonalDocument";
import PersonalVisit from "@/models/PersonalVisit";
import StockItem from "@/models/StockItem";
import Vehicle from "@/models/Vehicle";
import VehicleService from "@/models/VehicleService";

const URGENT_DAYS = 14;
const UPCOMING_DAYS = 60;
const URGENT_KM = 500;
const UPCOMING_KM = 2000;

export const dynamic = "force-dynamic";

export type ReminderItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  reason: string;
  tone: "urgent" | "upcoming";
  sortKey: number;
  overdue?: boolean;
  refill?: {
    usageMode: "daily" | "static";
    unit: string;
    currentStock: number;
  };
};

type LeanService = {
  _id: unknown;
  vehicleId: unknown;
  type: ServiceType;
  title: string;
  mileage?: number;
  nextDueAt?: Date | null;
  nextDueMileage?: number | null;
  performedAt: Date;
};

type LeanVehicle = {
  _id: unknown;
  name: string;
  mileage: number;
  type?: VehicleKind;
};

type LeanStockItem = {
  _id: unknown;
  name: string;
  category: StockCategory;
  usageMode?: "static" | "daily";
  quantity?: number;
  unit: string;
  minQuantity?: number;
  stock?: number;
  stockDate?: Date | null;
  dailyUsage?: number;
  reminderThreshold?: number;
  expiresAt?: Date | null;
};

function daysUntil(date: Date, now: Date) {
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function resolveDue(service: LeanService, vehicleKind: VehicleKind = "car") {
  const interval = getServiceInterval(service.type, vehicleKind);

  let dueAt = service.nextDueAt ? new Date(service.nextDueAt) : null;
  let dueMileage =
    service.nextDueMileage == null ? null : Number(service.nextDueMileage);

  if (!dueAt && interval?.months) {
    dueAt = addMonths(new Date(service.performedAt), interval.months);
  }

  if (dueMileage == null && interval?.km && service.mileage != null) {
    dueMileage = Number(service.mileage) + interval.km;
  }

  return {dueAt, dueMileage};
}

function formatDueReason(options: {
  days: number | null;
  kmLeft: number | null;
}) {
  const parts: string[] = [];

  if (options.days != null) {
    if (options.days < 0) {
      parts.push(`po terminie o ${Math.abs(options.days)} dni`);
    } else if (options.days === 0) {
      parts.push("termin dziś");
    } else {
      parts.push(`za ${options.days} dni`);
    }
  }

  if (options.kmLeft != null) {
    if (options.kmLeft <= 0) {
      parts.push(
        `przekroczony przebieg o ${Math.abs(options.kmLeft).toLocaleString("pl-PL")} km`
      );
    } else {
      parts.push(`za ${options.kmLeft.toLocaleString("pl-PL")} km`);
    }
  }

  return parts.join(" · ");
}

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const vehicles = (await Vehicle.find({userId}).lean()) as LeanVehicle[];
    const vehicleMap = new Map(
      vehicles.map((vehicle) => [String(vehicle._id), vehicle])
    );

    const services = (await VehicleService.find({userId})
      .sort({performedAt: -1})
      .lean()) as LeanService[];

    const latestByKey = new Map<string, LeanService>();

    for (const service of services) {
      const key = `${String(service.vehicleId)}:${service.type}`;
      if (!latestByKey.has(key)) {
        latestByKey.set(key, service);
      }
    }

    const now = todayCalendarDate();
    now.setHours(0, 0, 0, 0);

    const urgent: ReminderItem[] = [];
    const upcoming: ReminderItem[] = [];

    for (const service of latestByKey.values()) {
      const vehicle = vehicleMap.get(String(service.vehicleId));
      if (!vehicle) continue;

      const {dueAt, dueMileage} = resolveDue(
        service,
        (vehicle.type || "car") as VehicleKind
      );

      if (!dueAt && dueMileage == null) continue;

      if (dueAt) dueAt.setHours(0, 0, 0, 0);

      const days = dueAt ? daysUntil(dueAt, now) : null;
      const kmLeft =
        dueMileage != null ? dueMileage - (vehicle.mileage || 0) : null;

      const isDateUrgent = days != null && days <= URGENT_DAYS;
      const isKmUrgent = kmLeft != null && kmLeft <= URGENT_KM;
      const isDateUpcoming =
        days != null && days > URGENT_DAYS && days <= UPCOMING_DAYS;
      const isKmUpcoming =
        kmLeft != null && kmLeft > URGENT_KM && kmLeft <= UPCOMING_KM;

      if (!isDateUrgent && !isKmUrgent && !isDateUpcoming && !isKmUpcoming) {
        continue;
      }

      const typeLabel = SERVICE_TYPE_LABELS[service.type] || service.title;
      const sortKey = Math.min(
        days ?? Number.POSITIVE_INFINITY,
        kmLeft != null ? kmLeft / 50 : Number.POSITIVE_INFINITY
      );

      const overdue =
        (days != null && days < 0) || (kmLeft != null && kmLeft <= 0);

      const item: ReminderItem = {
        id: String(service._id),
        title: service.title || typeLabel,
        subtitle: vehicle.name,
        href: `/vehicles/${String(service.vehicleId)}`,
        reason: formatDueReason({days, kmLeft}),
        tone: isDateUrgent || isKmUrgent ? "urgent" : "upcoming",
        sortKey,
        overdue,
      };

      if (item.tone === "urgent") {
        urgent.push(item);
      } else {
        upcoming.push(item);
      }
    }

    urgent.sort((a, b) => a.sortKey - b.sortKey);
    upcoming.sort((a, b) => a.sortKey - b.sortKey);

    const stockItems = (await StockItem.find({userId}).lean()) as LeanStockItem[];
    const stock: ReminderItem[] = [];
    const expiryLimit = new Date(now);
    expiryLimit.setDate(expiryLimit.getDate() + 30);

    for (const item of stockItems) {
      const enriched = enrichStockItem(item, now);
      const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
      if (expiresAt) expiresAt.setHours(0, 0, 0, 0);

      const expiring =
        expiresAt != null && expiresAt.getTime() <= expiryLimit.getTime();

      if (!enriched.isUrgent && !expiring) continue;

      const reasons: string[] = [];

      if (enriched.isUrgent) {
        if (enriched.usageMode === "daily") {
          const daysLabel =
            enriched.daysRemaining != null
              ? ` · zapas na ~${enriched.daysRemaining} dni`
              : "";
          reasons.push(
            enriched.currentStock <= 0
              ? "brak na stanie"
              : `zostało ${enriched.currentStock} ${item.unit} (próg ${item.reminderThreshold})${daysLabel}`
          );
        } else {
          reasons.push(
            enriched.currentStock <= 0
              ? "brak na stanie"
              : `zostało ${enriched.currentStock} ${item.unit} (próg ${item.minQuantity})`
          );
        }
      }

      if (expiring && expiresAt) {
        const days = daysUntil(expiresAt, now);
        if (days < 0) {
          reasons.push(`przeterminowane o ${Math.abs(days)} dni`);
        } else if (days === 0) {
          reasons.push("ważność kończy się dziś");
        } else {
          reasons.push(`ważne jeszcze ${days} dni`);
        }
      }

      const expiryDays =
        expiresAt != null ? daysUntil(expiresAt, now) : null;
      const overdue =
        enriched.currentStock <= 0 ||
        (expiryDays != null && expiryDays < 0);

      stock.push({
        id: String(item._id),
        title: item.name,
        subtitle: STOCK_CATEGORY_LABELS[item.category] || "Zapas",
        href: "/stock",
        reason: reasons.join(" · "),
        tone: "urgent",
        sortKey: enriched.isUrgent
          ? enriched.currentStock
          : daysUntil(expiresAt!, now),
        overdue,
        refill: {
          usageMode: enriched.usageMode,
          unit: item.unit,
          currentStock: enriched.currentStock,
        },
      });
    }

    stock.sort((a, b) => a.sortKey - b.sortKey);

    const insurancePolicies = (await InsurancePolicy.find({userId}).lean()) as {
      _id: unknown;
      name: string;
      type: InsuranceType;
      insurer?: string;
      endsAt: Date;
    }[];

    for (const policy of insurancePolicies) {
      const enriched = enrichInsurance(policy, now);
      const days = enriched.daysUntilEnd;

      if (days > INSURANCE_UPCOMING_DAYS) continue;

      const reason =
        days < 0
          ? `po terminie o ${Math.abs(days)} dni`
          : days === 0
            ? "kończy się dziś"
            : `kończy się za ${days} dni`;

      const item: ReminderItem = {
        id: `insurance-${String(policy._id)}`,
        title: policy.name,
        subtitle: [
          INSURANCE_TYPE_LABELS[normalizeInsuranceType(policy.type)],
          policy.insurer || null,
        ]
          .filter(Boolean)
          .join(" · "),
        href: "/insurance",
        reason,
        tone: days <= INSURANCE_URGENT_DAYS ? "urgent" : "upcoming",
        sortKey: days,
        overdue: days < 0,
      };

      if (item.tone === "urgent") {
        urgent.push(item);
      } else {
        upcoming.push(item);
      }
    }

    const personalDocuments = (await PersonalDocument.find({userId}).lean()) as {
      _id: unknown;
      name: string;
      type: DocumentType;
      issuer?: string;
      expiresAt: Date;
    }[];

    for (const document of personalDocuments) {
      const enriched = enrichDocument(document, now);
      const days = enriched.daysUntilExpiry;

      if (days > DOCUMENT_UPCOMING_DAYS) continue;

      const reason =
        days < 0
          ? `po terminie o ${Math.abs(days)} dni`
          : days === 0
            ? "wygasa dziś"
            : `wygasa za ${days} dni`;

      const item: ReminderItem = {
        id: `document-${String(document._id)}`,
        title: document.name,
        subtitle: [
          DOCUMENT_TYPE_LABELS[normalizeDocumentType(document.type)],
          document.issuer || null,
        ]
          .filter(Boolean)
          .join(" · "),
        href: "/documents",
        reason,
        tone: days <= DOCUMENT_URGENT_DAYS ? "urgent" : "upcoming",
        sortKey: days,
        overdue: days < 0,
      };

      if (item.tone === "urgent") {
        urgent.push(item);
      } else {
        upcoming.push(item);
      }
    }

    const personalVisits = (await PersonalVisit.find({userId}).lean()) as {
      _id: unknown;
      name: string;
      type: VisitType;
      providerName?: string;
      nextDueAt: Date;
    }[];

    for (const visit of personalVisits) {
      const enriched = enrichVisit(visit, now);
      const days = enriched.daysUntilDue;

      if (days > VISIT_UPCOMING_DAYS) continue;

      const reason =
        days < 0
          ? `po terminie o ${Math.abs(days)} dni`
          : days === 0
            ? "wizyta dziś"
            : `wizyta za ${days} dni`;

      const item: ReminderItem = {
        id: `visit-${String(visit._id)}`,
        title: visit.name,
        subtitle: [
          VISIT_TYPE_LABELS[normalizeVisitType(visit.type)],
          visit.providerName || null,
        ]
          .filter(Boolean)
          .join(" · "),
        href: "/visits",
        reason,
        tone: days <= VISIT_URGENT_DAYS ? "urgent" : "upcoming",
        sortKey: days,
        overdue: days < 0,
      };

      if (item.tone === "urgent") {
        urgent.push(item);
      } else {
        upcoming.push(item);
      }
    }

    urgent.sort((a, b) => a.sortKey - b.sortKey);
    upcoming.sort((a, b) => a.sortKey - b.sortKey);

    const overdueCount =
      urgent.filter((item) => item.overdue).length +
      stock.filter((item) => item.overdue).length;
    const attentionCount = urgent.length + stock.length;

    return NextResponse.json({
      urgent,
      upcoming,
      stock,
      summary: {
        overdueCount,
        attentionCount,
        upcomingCount: upcoming.length,
      },
    });
  } catch (error) {
    console.error("GET reminders error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać przypomnień"},
      {status: 500}
    );
  }
}

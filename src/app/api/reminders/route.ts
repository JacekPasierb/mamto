import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {SERVICE_TYPE_LABELS, type ServiceType} from "@/lib/serviceTypes";
import {STOCK_CATEGORY_LABELS, type StockCategory} from "@/lib/stockTypes";
import StockItem from "@/models/StockItem";
import Vehicle from "@/models/Vehicle";
import VehicleService from "@/models/VehicleService";

const URGENT_DAYS = 14;
const UPCOMING_DAYS = 60;
const URGENT_KM = 500;
const UPCOMING_KM = 2000;

const DEFAULT_INTERVALS: Partial<
  Record<
    ServiceType,
    {
      months: number;
      km: number;
    }
  >
> = {
  oil: {months: 12, km: 15000},
  inspection: {months: 12, km: 0},
  filters: {months: 12, km: 15000},
  tires: {months: 48, km: 40000},
  brakes: {months: 24, km: 30000},
  wipers: {months: 12, km: 0},
};

export type ReminderItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  reason: string;
  tone: "urgent" | "upcoming";
  sortKey: number;
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
};

type LeanStockItem = {
  _id: unknown;
  name: string;
  category: StockCategory;
  quantity: number;
  unit: string;
  minQuantity: number;
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

function resolveDue(service: LeanService) {
  const interval = DEFAULT_INTERVALS[service.type];

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

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const urgent: ReminderItem[] = [];
    const upcoming: ReminderItem[] = [];

    for (const service of latestByKey.values()) {
      const vehicle = vehicleMap.get(String(service.vehicleId));
      if (!vehicle) continue;

      const {dueAt, dueMileage} = resolveDue(service);

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

      const item: ReminderItem = {
        id: String(service._id),
        title: service.title || typeLabel,
        subtitle: vehicle.name,
        href: `/vehicles/${String(service.vehicleId)}`,
        reason: formatDueReason({days, kmLeft}),
        tone: isDateUrgent || isKmUrgent ? "urgent" : "upcoming",
        sortKey,
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
      const low = item.quantity <= item.minQuantity;
      const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
      if (expiresAt) expiresAt.setHours(0, 0, 0, 0);

      const expiring =
        expiresAt != null && expiresAt.getTime() <= expiryLimit.getTime();

      if (!low && !expiring) continue;

      const reasons: string[] = [];

      if (low) {
        reasons.push(
          item.quantity <= 0
            ? "brak na stanie"
            : `zostało ${item.quantity} ${item.unit} (próg ${item.minQuantity})`
        );
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

      stock.push({
        id: String(item._id),
        title: item.name,
        subtitle: STOCK_CATEGORY_LABELS[item.category] || "Zapas",
        href: "/stock",
        reason: reasons.join(" · "),
        tone: "urgent",
        sortKey: low ? item.quantity : daysUntil(expiresAt!, now),
      });
    }

    stock.sort((a, b) => a.sortKey - b.sortKey);

    return NextResponse.json({
      urgent,
      upcoming,
      stock,
    });
  } catch (error) {
    console.error("GET reminders error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać przypomnień"},
      {status: 500}
    );
  }
}

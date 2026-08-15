import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichVisit} from "@/lib/visitHelpers";
import {
  VISIT_DEFAULT_INTERVAL_MONTHS,
  VISIT_FORM_TYPES,
  VISIT_TYPES,
  type VisitType,
} from "@/lib/visitTypes";
import {connectDB} from "@/lib/mongodb";
import PersonalVisit from "@/models/PersonalVisit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const visits = await PersonalVisit.find({userId})
      .sort({nextDueAt: 1, name: 1})
      .lean();

    const now = todayCalendarDate();

    return NextResponse.json(
      visits.map((item) =>
        enrichVisit(item as Parameters<typeof enrichVisit>[0], now)
      ),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET visits error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać wizyt"},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const body = await request.json();
    const {
      name,
      type,
      providerName,
      lastVisitAt,
      nextDueAt,
      intervalMonths,
      notes,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa wizyty jest wymagana"},
        {status: 400}
      );
    }

    if (!nextDueAt) {
      return NextResponse.json(
        {message: "Termin kolejnej wizyty jest wymagany"},
        {status: 400}
      );
    }

    if (
      type &&
      !VISIT_FORM_TYPES.includes(type as (typeof VISIT_FORM_TYPES)[number]) &&
      !VISIT_TYPES.includes(type as VisitType)
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ wizyty"},
        {status: 400}
      );
    }

    const resolvedType = (type as VisitType) || "health";
    const resolvedInterval =
      intervalMonths === "" || intervalMonths == null
        ? VISIT_DEFAULT_INTERVAL_MONTHS[resolvedType]
        : Number(intervalMonths);

    await connectDB();

    const visit = await PersonalVisit.create({
      userId,
      name: name.trim(),
      type: resolvedType,
      providerName: providerName?.trim() || "",
      lastVisitAt: lastVisitAt ? parseCalendarDate(lastVisitAt) : null,
      nextDueAt: parseCalendarDate(nextDueAt),
      intervalMonths:
        Number.isFinite(resolvedInterval) && resolvedInterval > 0
          ? resolvedInterval
          : null,
      notes: notes?.trim() || "",
    });

    return NextResponse.json(
      enrichVisit(visit.toObject(), todayCalendarDate()),
      {status: 201}
    );
  } catch (error) {
    console.error("POST visits error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać wizyty"},
      {status: 500}
    );
  }
}

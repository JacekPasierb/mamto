import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {connectDB} from "@/lib/mongodb";
import {resolveVisitProvider} from "@/lib/resolveVisitProvider";
import {enrichVisit} from "@/lib/visitHelpers";
import {
  VISIT_DEFAULT_INTERVAL_MONTHS,
  VISIT_FORM_TYPES,
  VISIT_TYPES,
  type VisitType,
} from "@/lib/visitTypes";
import PersonalVisit from "@/models/PersonalVisit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id} = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    const body = await request.json();
    const {
      name,
      type,
      providerName,
      providerId,
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

    const provider = await resolveVisitProvider(userId, {
      category: resolvedType,
      providerId,
      providerName,
    });

    const visit = await PersonalVisit.findOneAndUpdate(
      {_id: id, userId},
      {
        name: name.trim(),
        type: resolvedType,
        providerName: provider.providerName,
        providerId: provider.providerId,
        lastVisitAt: lastVisitAt ? parseCalendarDate(lastVisitAt) : null,
        nextDueAt: parseCalendarDate(nextDueAt),
        intervalMonths:
          Number.isFinite(resolvedInterval) && resolvedInterval > 0
            ? resolvedInterval
            : null,
        notes: notes?.trim() || "",
        reminderDismissed: false,
      },
      {new: true}
    );

    if (!visit) {
      return NextResponse.json(
        {message: "Nie znaleziono wizyty"},
        {status: 404}
      );
    }

    return NextResponse.json(
      enrichVisit(visit.toObject(), todayCalendarDate())
    );
  } catch (error) {
    console.error("PUT visits error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować wizyty"},
      {status: 500}
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id} = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    await connectDB();

    const visit = await PersonalVisit.findOneAndDelete({_id: id, userId});

    if (!visit) {
      return NextResponse.json(
        {message: "Nie znaleziono wizyty"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE visits error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć wizyty"},
      {status: 500}
    );
  }
}

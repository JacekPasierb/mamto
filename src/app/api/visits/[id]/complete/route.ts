import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {addMonths, enrichVisit} from "@/lib/visitHelpers";
import {
  VISIT_DEFAULT_INTERVAL_MONTHS,
  type VisitType,
} from "@/lib/visitTypes";
import {connectDB} from "@/lib/mongodb";
import PersonalVisit from "@/models/PersonalVisit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id} = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    const body = await request.json().catch(() => ({}));
    const completedAt = body.completedAt
      ? parseCalendarDate(body.completedAt)
      : todayCalendarDate();

    await connectDB();

    const existing = await PersonalVisit.findOne({_id: id, userId});

    if (!existing) {
      return NextResponse.json(
        {message: "Nie znaleziono wizyty"},
        {status: 404}
      );
    }

    const interval =
      existing.intervalMonths && existing.intervalMonths > 0
        ? existing.intervalMonths
        : VISIT_DEFAULT_INTERVAL_MONTHS[existing.type as VisitType] || 6;

    const nextDueAt = addMonths(completedAt, interval);

    const visit = await PersonalVisit.findOneAndUpdate(
      {_id: id, userId},
      {
        lastVisitAt: completedAt,
        nextDueAt,
      },
      {new: true}
    );

    return NextResponse.json(
      enrichVisit(visit!.toObject(), todayCalendarDate())
    );
  } catch (error) {
    console.error("POST complete visit error:", error);

    return NextResponse.json(
      {message: "Nie udało się oznaczyć wizyty"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {addMonths, enrichPetCare} from "@/lib/petHelpers";
import {
  PET_CARE_DEFAULT_INTERVAL_MONTHS,
  type PetCareType,
} from "@/lib/petTypes";
import {connectDB} from "@/lib/mongodb";
import PetCare from "@/models/PetCare";

type RouteContext = {
  params: Promise<{id: string; careId: string}>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id, careId} = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(careId)
    ) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    const body = await request.json().catch(() => ({}));
    const completedAt = body.completedAt
      ? parseCalendarDate(body.completedAt)
      : todayCalendarDate();

    await connectDB();

    const existing = await PetCare.findOne({
      _id: careId,
      petId: id,
      userId,
    });

    if (!existing) {
      return NextResponse.json(
        {message: "Nie znaleziono zabiegu"},
        {status: 404}
      );
    }

    if (!existing.nextDueAt) {
      return NextResponse.json(
        {message: "Ten wpis jest już zamknięty"},
        {status: 400}
      );
    }

    const interval =
      existing.intervalMonths && existing.intervalMonths > 0
        ? existing.intervalMonths
        : PET_CARE_DEFAULT_INTERVAL_MONTHS[existing.type as PetCareType] || 6;

    const nextDueAt = addMonths(completedAt, interval);

    // Zamknij bieżący wpis jako wykonany (zostaje w liście jako historia).
    const closed = await PetCare.findOneAndUpdate(
      {_id: careId, petId: id, userId},
      {
        lastDoneAt: completedAt,
        nextDueAt: null,
      },
      {new: true}
    );

    // Dodaj kolejny wpis z nowym terminem do pilnowania.
    const next = await PetCare.create({
      userId,
      petId: id,
      name: existing.name,
      type: existing.type,
      diseases: existing.diseases || [],
      providerName: existing.providerName || "",
      lastDoneAt: completedAt,
      nextDueAt,
      intervalMonths: existing.intervalMonths,
      notes: existing.notes || "",
    });

    const now = todayCalendarDate();

    return NextResponse.json({
      closed: enrichPetCare(closed!.toObject(), now),
      next: enrichPetCare(next.toObject(), now),
    });
  } catch (error) {
    console.error("POST complete pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się oznaczyć zabiegu"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichPetCare} from "@/lib/petHelpers";
import {connectDB} from "@/lib/mongodb";
import PetCare from "@/models/PetCare";

type RouteContext = {
  params: Promise<{id: string; careId: string}>;
};

export async function POST(_request: Request, context: RouteContext) {
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

    // Wyłącz powiadomienie. Data wykonania = wpisany następny termin
    // (np. 14.12), nie poprzednia data ani wynik z interwału.
    const item = await PetCare.findOneAndUpdate(
      {_id: careId, petId: id, userId},
      {
        lastDoneAt: existing.nextDueAt,
        nextDueAt: null,
      },
      {new: true}
    );

    return NextResponse.json(
      enrichPetCare(item!.toObject(), todayCalendarDate())
    );
  } catch (error) {
    console.error("POST complete pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się oznaczyć zabiegu"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichVisit} from "@/lib/visitHelpers";
import {connectDB} from "@/lib/mongodb";
import PersonalVisit from "@/models/PersonalVisit";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
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

    const existing = await PersonalVisit.findOne({_id: id, userId});

    if (!existing) {
      return NextResponse.json(
        {message: "Nie znaleziono wizyty"},
        {status: 404}
      );
    }

    if (existing.reminderDismissed) {
      return NextResponse.json(
        enrichVisit(existing.toObject(), todayCalendarDate())
      );
    }

    // Tylko schowaj „Po terminie” / powiadomienie — daty bez zmian.
    const visit = await PersonalVisit.findOneAndUpdate(
      {_id: id, userId},
      {reminderDismissed: true},
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

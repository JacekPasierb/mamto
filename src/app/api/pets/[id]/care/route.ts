import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichPetCare} from "@/lib/petHelpers";
import {
  PET_CARE_DEFAULT_INTERVAL_MONTHS,
  PET_CARE_TYPES,
  normalizeInfectiousDiseases,
  type PetCareType,
} from "@/lib/petTypes";
import {connectDB} from "@/lib/mongodb";
import Pet from "@/models/Pet";
import PetCare from "@/models/PetCare";

type RouteContext = {
  params: Promise<{id: string}>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
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

    const pet = await Pet.findOne({_id: id, userId}).lean();

    if (!pet) {
      return NextResponse.json(
        {message: "Nie znaleziono zwierzęcia"},
        {status: 404}
      );
    }

    const items = await PetCare.find({userId, petId: id})
      .sort({nextDueAt: 1, name: 1})
      .lean();

    const now = todayCalendarDate();

    return NextResponse.json(
      items.map((item) =>
        enrichPetCare(item as Parameters<typeof enrichPetCare>[0], now)
      ),
      {headers: {"Cache-Control": "no-store"}}
    );
  } catch (error) {
    console.error("GET pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać opieki"},
      {status: 500}
    );
  }
}

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

    const body = await request.json();
    const {
      name,
      type,
      diseases,
      providerName,
      lastDoneAt,
      nextDueAt,
      intervalMonths,
      notes,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa zabiegu jest wymagana"},
        {status: 400}
      );
    }

    if (!nextDueAt) {
      return NextResponse.json(
        {message: "Termin kolejnego zabiegu jest wymagany"},
        {status: 400}
      );
    }

    if (type && !(PET_CARE_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ opieki"},
        {status: 400}
      );
    }

    await connectDB();

    const pet = await Pet.findOne({_id: id, userId}).lean();

    if (!pet) {
      return NextResponse.json(
        {message: "Nie znaleziono zwierzęcia"},
        {status: 404}
      );
    }

    const resolvedType = (type as PetCareType) || "rabies";
    const resolvedDiseases =
      resolvedType === "infectious"
        ? normalizeInfectiousDiseases(diseases)
        : [];

    if (resolvedType === "infectious" && resolvedDiseases.length === 0) {
      return NextResponse.json(
        {message: "Wybierz przynajmniej jedną chorobę"},
        {status: 400}
      );
    }

    const resolvedInterval =
      intervalMonths === "" || intervalMonths == null
        ? PET_CARE_DEFAULT_INTERVAL_MONTHS[resolvedType]
        : Number(intervalMonths);

    const resolvedLastDoneAt = lastDoneAt
      ? parseCalendarDate(lastDoneAt)
      : null;

    const item = await PetCare.create({
      userId,
      petId: id,
      name: name.trim(),
      type: resolvedType,
      diseases: resolvedDiseases,
      providerName: providerName?.trim() || "",
      lastDoneAt: resolvedLastDoneAt,
      nextDueAt: parseCalendarDate(nextDueAt),
      intervalMonths:
        Number.isFinite(resolvedInterval) && resolvedInterval > 0
          ? resolvedInterval
          : null,
      notes: notes?.trim() || "",
    });

    return NextResponse.json(
      enrichPetCare(item.toObject(), todayCalendarDate()),
      {status: 201}
    );
  } catch (error) {
    console.error("POST pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać zabiegu"},
      {status: 500}
    );
  }
}

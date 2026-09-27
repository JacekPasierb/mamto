import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichPetCare} from "@/lib/petHelpers";
import {resolveMedication} from "@/lib/resolveMedication";
import {resolvePetVet} from "@/lib/resolvePetVet";
import {
  PET_CARE_DEFAULT_INTERVAL_MONTHS,
  PET_CARE_TYPES,
  normalizeInfectiousDiseases,
  type PetCareType,
} from "@/lib/petTypes";
import {connectDB} from "@/lib/mongodb";
import PetCare from "@/models/PetCare";

type RouteContext = {
  params: Promise<{id: string; careId: string}>;
};

export async function PUT(request: Request, context: RouteContext) {
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

    const body = await request.json();
    const {
      name,
      type,
      diseases,
      providerName,
      providerVetId,
      medicationName,
      medicationId,
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

    await connectDB();

    let resolvedProviderName = providerName?.trim() || "";
    if (providerVetId) {
      const resolvedVet = await resolvePetVet(userId, {
        vetId: providerVetId,
        vetName: resolvedProviderName,
      });
      resolvedProviderName = resolvedVet.vetName || resolvedProviderName;
    }

    const resolvedMedication = await resolveMedication(userId, {
      medicationId,
      medicationName,
    });

    const item = await PetCare.findOneAndUpdate(
      {_id: careId, petId: id, userId},
      {
        name: name.trim(),
        type: resolvedType,
        diseases: resolvedDiseases,
        providerName: resolvedProviderName,
        medicationName: resolvedMedication.medicationName,
        lastDoneAt: lastDoneAt ? parseCalendarDate(lastDoneAt) : null,
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

    if (!item) {
      return NextResponse.json(
        {message: "Nie znaleziono zabiegu"},
        {status: 404}
      );
    }

    return NextResponse.json(
      enrichPetCare(item.toObject(), todayCalendarDate())
    );
  } catch (error) {
    console.error("PUT pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować zabiegu"},
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

    const {id, careId} = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(careId)
    ) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    await connectDB();

    const item = await PetCare.findOneAndDelete({
      _id: careId,
      petId: id,
      userId,
    });

    if (!item) {
      return NextResponse.json(
        {message: "Nie znaleziono zabiegu"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE pet care error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć zabiegu"},
      {status: 500}
    );
  }
}

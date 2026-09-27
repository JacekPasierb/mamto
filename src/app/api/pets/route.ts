import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {parseCalendarDate} from "@/lib/calculateCurrentStock";
import {resolvePetVet} from "@/lib/resolvePetVet";
import {PET_SPECIES, type PetSpecies} from "@/lib/petTypes";
import {connectDB} from "@/lib/mongodb";
import Pet from "@/models/Pet";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const pets = await Pet.find({userId}).sort({name: 1}).lean();

    return NextResponse.json(pets, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    console.error("GET pets error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać zwierząt"},
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
      species,
      breed,
      birthDate,
      microchipId,
      vetName,
      vetId,
      notes,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Imię zwierzęcia jest wymagane"},
        {status: 400}
      );
    }

    const resolvedSpecies = (
      (PET_SPECIES as readonly string[]).includes(species)
        ? species
        : "dog"
    ) as PetSpecies;

    await connectDB();

    const resolvedVet = await resolvePetVet(userId, {vetId, vetName});

    const pet = await Pet.create({
      userId,
      name: name.trim(),
      species: resolvedSpecies,
      breed: breed?.trim() || "",
      birthDate: birthDate ? parseCalendarDate(birthDate) : null,
      microchipId: microchipId?.trim() || "",
      vetName: resolvedVet.vetName,
      vetId: resolvedVet.vetId,
      notes: notes?.trim() || "",
    });

    return NextResponse.json(pet.toObject(), {status: 201});
  } catch (error) {
    console.error("POST pets error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać zwierzęcia"},
      {status: 500}
    );
  }
}

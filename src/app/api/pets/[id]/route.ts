import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate} from "@/lib/calculateCurrentStock";
import {PET_SPECIES, type PetSpecies} from "@/lib/petTypes";
import {connectDB} from "@/lib/mongodb";
import Pet from "@/models/Pet";
import PetCare from "@/models/PetCare";

type RouteContext = {
  params: Promise<{id: string}>;
};

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

    return NextResponse.json(pet);
  } catch (error) {
    console.error("GET pet error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać zwierzęcia"},
      {status: 500}
    );
  }
}

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
    const {name, species, breed, birthDate, microchipId, vetName, notes} =
      body;

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

    const pet = await Pet.findOneAndUpdate(
      {_id: id, userId},
      {
        name: name.trim(),
        species: resolvedSpecies,
        breed: breed?.trim() || "",
        birthDate: birthDate ? parseCalendarDate(birthDate) : null,
        microchipId: microchipId?.trim() || "",
        vetName: vetName?.trim() || "",
        notes: notes?.trim() || "",
      },
      {new: true}
    );

    if (!pet) {
      return NextResponse.json(
        {message: "Nie znaleziono zwierzęcia"},
        {status: 404}
      );
    }

    return NextResponse.json(pet.toObject());
  } catch (error) {
    console.error("PUT pet error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować zwierzęcia"},
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

    const pet = await Pet.findOneAndDelete({_id: id, userId});

    if (!pet) {
      return NextResponse.json(
        {message: "Nie znaleziono zwierzęcia"},
        {status: 404}
      );
    }

    await PetCare.deleteMany({userId, petId: id});

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE pet error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć zwierzęcia"},
      {status: 500}
    );
  }
}

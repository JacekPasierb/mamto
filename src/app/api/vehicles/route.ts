import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const vehicles = await Vehicle.find({userId}).sort({
      createdAt: -1,
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("GET vehicles error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać pojazdów"},
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

    const {name, brand, model, mileage, type, year, vin, plateNumber} = body;

    if (!name) {
      return NextResponse.json(
        {message: "Nazwa pojazdu jest wymagana"},
        {status: 400}
      );
    }

    await connectDB();

    const vehicle = await Vehicle.create({
      userId,
      name: name.trim(),
      brand: brand?.trim() || "",
      model: model?.trim() || "",
      year:
        year === "" || year == null
          ? null
          : Number(year) || null,
      vin: vin?.trim().toUpperCase() || "",
      plateNumber: plateNumber?.trim().toUpperCase() || "",
      mileage: Number(mileage) || 0,
      type: type || "car",
    });

    return NextResponse.json(vehicle, {
      status: 201,
    });
  } catch (error) {
    console.error("POST vehicle error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać pojazdu"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import VehicleService from "@/models/VehicleService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VEHICLE_TYPES = ["car", "motorcycle", "other"] as const;

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
    const {name, brand, model, mileage, type, year, vin, plateNumber} = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa pojazdu jest wymagana"},
        {status: 400}
      );
    }

    if (
      type &&
      !VEHICLE_TYPES.includes(type as (typeof VEHICLE_TYPES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ pojazdu"},
        {status: 400}
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findOneAndUpdate(
      {_id: id, userId},
      {
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
      },
      {new: true}
    );

    if (!vehicle) {
      return NextResponse.json(
        {message: "Nie znaleziono pojazdu"},
        {status: 404}
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("PUT vehicle error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować pojazdu"},
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

    const vehicle = await Vehicle.findOneAndDelete({_id: id, userId});

    if (!vehicle) {
      return NextResponse.json(
        {message: "Nie znaleziono pojazdu"},
        {status: 404}
      );
    }

    await VehicleService.deleteMany({vehicleId: id, userId});

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE vehicle error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć pojazdu"},
      {status: 500}
    );
  }
}

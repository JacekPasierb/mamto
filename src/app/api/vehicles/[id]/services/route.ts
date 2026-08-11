import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import {SERVICE_TYPES} from "@/lib/serviceTypes";
import VehicleService from "@/models/VehicleService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

    const vehicle = await Vehicle.findOne({_id: id, userId}).lean();

    if (!vehicle) {
      return NextResponse.json(
        {message: "Nie znaleziono pojazdu"},
        {status: 404}
      );
    }

    const services = await VehicleService.find({
      userId,
      vehicleId: id,
    }).sort({performedAt: -1});

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET vehicle services error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać serwisów"},
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
      type,
      title,
      performedAt,
      mileage,
      nextDueAt,
      nextDueMileage,
      notes,
      cost,
    } = body;

    if (
      !type ||
      !SERVICE_TYPES.includes(type as (typeof SERVICE_TYPES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ serwisu"},
        {status: 400}
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        {message: "Tytuł serwisu jest wymagany"},
        {status: 400}
      );
    }

    if (!performedAt) {
      return NextResponse.json(
        {message: "Data wykonania jest wymagana"},
        {status: 400}
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findOne({_id: id, userId});

    if (!vehicle) {
      return NextResponse.json(
        {message: "Nie znaleziono pojazdu"},
        {status: 404}
      );
    }

    const serviceMileage = Number(mileage) || 0;

    const service = await VehicleService.create({
      userId,
      vehicleId: id,
      type,
      title: title.trim(),
      performedAt: new Date(performedAt),
      mileage: serviceMileage,
      nextDueAt: nextDueAt ? new Date(nextDueAt) : null,
      nextDueMileage:
        nextDueMileage === "" || nextDueMileage == null
          ? null
          : Number(nextDueMileage),
      notes: notes?.trim() || "",
      cost: cost === "" || cost == null ? null : Number(cost),
    });

    if (serviceMileage > vehicle.mileage) {
      vehicle.mileage = serviceMileage;
      await vehicle.save();
    }

    return NextResponse.json(service, {status: 201});
  } catch (error) {
    console.error("POST vehicle service error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać serwisu"},
      {status: 500}
    );
  }
}

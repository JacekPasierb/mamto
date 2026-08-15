import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import {resolveNextDueAt, resolveNextDueMileage} from "@/lib/serviceDefaults";
import {resolveServiceWorkshop} from "@/lib/resolveServiceWorkshop";
import {SERVICE_TYPES, type ServiceType, type VehicleKind} from "@/lib/serviceTypes";
import Vehicle from "@/models/Vehicle";
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
      performedBy,
      workshopId,
      workshopName,
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
    const vehicleKind = (vehicle.type || "car") as VehicleKind;

    const workshopFields = await resolveServiceWorkshop(userId, {
      performedBy,
      workshopId,
      workshopName,
    });

    const service = await VehicleService.create({
      userId,
      vehicleId: id,
      type,
      title: title.trim(),
      performedAt: new Date(performedAt),
      mileage: serviceMileage,
      nextDueAt: resolveNextDueAt(
        type as ServiceType,
        performedAt,
        nextDueAt,
        vehicleKind
      ),
      nextDueMileage: resolveNextDueMileage(
        type as ServiceType,
        serviceMileage,
        nextDueMileage,
        vehicleKind
      ),
      notes: notes?.trim() || "",
      cost: cost === "" || cost == null ? null : Number(cost),
      performedBy: workshopFields.performedBy,
      workshopId: workshopFields.workshopId,
      workshopName: workshopFields.workshopName,
    });

    if (serviceMileage > vehicle.mileage) {
      vehicle.mileage = serviceMileage;
      await vehicle.save();
    }

    return NextResponse.json(service, {status: 201});
  } catch (error) {
    console.error("POST vehicle service error:", error);

    if (error instanceof Error && error.message === "Podaj nazwę warsztatu") {
      return NextResponse.json({message: error.message}, {status: 400});
    }

    return NextResponse.json(
      {message: "Nie udało się dodać serwisu"},
      {status: 500}
    );
  }
}

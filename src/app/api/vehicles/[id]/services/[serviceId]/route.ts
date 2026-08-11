import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import {SERVICE_TYPES} from "@/lib/serviceTypes";
import Vehicle from "@/models/Vehicle";
import VehicleService from "@/models/VehicleService";

type RouteContext = {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id, serviceId} = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(serviceId)
    ) {
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

    const service = await VehicleService.findOneAndUpdate(
      {
        _id: serviceId,
        vehicleId: id,
        userId,
      },
      {
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
      },
      {
        new: true,
      }
    );

    if (!service) {
      return NextResponse.json(
        {message: "Nie znaleziono serwisu"},
        {status: 404}
      );
    }

    if (serviceMileage > vehicle.mileage) {
      vehicle.mileage = serviceMileage;
      await vehicle.save();
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("PUT vehicle service error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować serwisu"},
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

    const {id, serviceId} = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(serviceId)
    ) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    await connectDB();

    const service = await VehicleService.findOneAndDelete({
      _id: serviceId,
      vehicleId: id,
      userId,
    });

    if (!service) {
      return NextResponse.json(
        {message: "Nie znaleziono serwisu"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE vehicle service error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć serwisu"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate, toDateInputValue} from "@/lib/calculateCurrentStock";
import {connectDB} from "@/lib/mongodb";
import {
  getDefaultNextDueAtInput,
  getDefaultNextDueMileage,
} from "@/lib/serviceDefaults";
import type {ServiceType, VehicleKind} from "@/lib/serviceTypes";
import Vehicle from "@/models/Vehicle";
import VehicleService from "@/models/VehicleService";

type RouteContext = {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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

    const body = await request.json().catch(() => ({}));
    const completedAt = body.completedAt
      ? parseCalendarDate(body.completedAt)
      : todayCalendarDate();

    await connectDB();

    const vehicle = await Vehicle.findOne({_id: id, userId});

    if (!vehicle) {
      return NextResponse.json(
        {message: "Nie znaleziono pojazdu"},
        {status: 404}
      );
    }

    const existing = await VehicleService.findOne({
      _id: serviceId,
      vehicleId: id,
      userId,
    });

    if (!existing) {
      return NextResponse.json(
        {message: "Nie znaleziono serwisu"},
        {status: 404}
      );
    }

    if (!existing.nextDueAt && existing.nextDueMileage == null) {
      return NextResponse.json(
        {message: "Ten wpis jest już zamknięty"},
        {status: 400}
      );
    }

    const vehicleKind = (vehicle.type || "car") as VehicleKind;
    const serviceMileage =
      body.mileage !== "" && body.mileage != null
        ? Number(body.mileage)
        : Number(existing.mileage) || Number(vehicle.mileage) || 0;

    const dateInput = toDateInputValue(completedAt);
    const nextDueAtInput = getDefaultNextDueAtInput(
      existing.type as ServiceType,
      dateInput,
      vehicleKind
    );
    const nextDueAt = nextDueAtInput
      ? (() => {
          const [year, month, day] = nextDueAtInput.split("-").map(Number);
          return new Date(year, month - 1, day);
        })()
      : null;
    const nextDueMileage = getDefaultNextDueMileage(
      existing.type as ServiceType,
      serviceMileage,
      vehicleKind
    );

    // Zamknij bieżący wpis — zostaje w liście jako historia.
    const closed = await VehicleService.findOneAndUpdate(
      {_id: serviceId, vehicleId: id, userId},
      {
        nextDueAt: null,
        nextDueMileage: null,
      },
      {new: true}
    );

    // Dodaj kolejne wykonanie z nowym terminem.
    const next = await VehicleService.create({
      userId,
      vehicleId: id,
      type: existing.type,
      title: existing.title,
      performedAt: completedAt,
      mileage: serviceMileage,
      nextDueAt,
      nextDueMileage,
      performedBy: existing.performedBy,
      workshopId: existing.workshopId,
      workshopName: existing.workshopName,
      notes: existing.notes || "",
      cost: null,
    });

    if (serviceMileage > vehicle.mileage) {
      vehicle.mileage = serviceMileage;
      await vehicle.save();
    }

    return NextResponse.json({
      closed,
      next,
    });
  } catch (error) {
    console.error("POST complete vehicle service error:", error);

    return NextResponse.json(
      {message: "Nie udało się oznaczyć serwisu"},
      {status: 500}
    );
  }
}

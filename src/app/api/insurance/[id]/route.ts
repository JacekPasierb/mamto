import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichInsurance} from "@/lib/insuranceHelpers";
import {
  INSURANCE_FORM_TYPES,
  INSURANCE_PAYMENT_FREQUENCIES,
  INSURANCE_TYPES,
} from "@/lib/insuranceTypes";
import {connectDB} from "@/lib/mongodb";
import InsurancePolicy from "@/models/InsurancePolicy";
import Vehicle from "@/models/Vehicle";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    const {
      name,
      type,
      insurer,
      policyNumber,
      startsAt,
      endsAt,
      premium,
      paymentFrequency,
      vehicleId,
      notes,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa polisy jest wymagana"},
        {status: 400}
      );
    }

    if (!endsAt) {
      return NextResponse.json(
        {message: "Data końca polisy jest wymagana"},
        {status: 400}
      );
    }

    if (
      type &&
      !INSURANCE_FORM_TYPES.includes(
        type as (typeof INSURANCE_FORM_TYPES)[number]
      ) &&
      !INSURANCE_TYPES.includes(type as (typeof INSURANCE_TYPES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ ubezpieczenia"},
        {status: 400}
      );
    }

    if (
      paymentFrequency &&
      !INSURANCE_PAYMENT_FREQUENCIES.includes(
        paymentFrequency as (typeof INSURANCE_PAYMENT_FREQUENCIES)[number]
      )
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowa częstotliwość płatności"},
        {status: 400}
      );
    }

    await connectDB();

    let resolvedVehicleId = null;

    if (vehicleId) {
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return NextResponse.json(
          {message: "Nieprawidłowe ID pojazdu"},
          {status: 400}
        );
      }

      const vehicle = await Vehicle.findOne({_id: vehicleId, userId}).lean();

      if (!vehicle) {
        return NextResponse.json(
          {message: "Nie znaleziono pojazdu"},
          {status: 404}
        );
      }

      resolvedVehicleId = vehicleId;
    }

    const policy = await InsurancePolicy.findOneAndUpdate(
      {_id: id, userId},
      {
        name: name.trim(),
        type: type || "vehicle",
        insurer: insurer?.trim() || "",
        policyNumber: policyNumber?.trim() || "",
        startsAt: startsAt ? parseCalendarDate(startsAt) : null,
        endsAt: parseCalendarDate(endsAt),
        premium: premium === "" || premium == null ? null : Number(premium),
        paymentFrequency: paymentFrequency || "yearly",
        vehicleId: resolvedVehicleId,
        notes: notes?.trim() || "",
      },
      {new: true}
    );

    if (!policy) {
      return NextResponse.json(
        {message: "Nie znaleziono polisy"},
        {status: 404}
      );
    }

    const enriched = enrichInsurance(policy.toObject(), todayCalendarDate());

    let vehicleName: string | null = null;

    if (policy.vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: policy.vehicleId,
        userId,
      })
        .select("name")
        .lean();

      vehicleName = vehicle?.name || null;
    }

    return NextResponse.json({
      ...enriched,
      vehicleName,
    });
  } catch (error) {
    console.error("PUT insurance error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować polisy"},
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

    const policy = await InsurancePolicy.findOneAndDelete({_id: id, userId});

    if (!policy) {
      return NextResponse.json(
        {message: "Nie znaleziono polisy"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE insurance error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć polisy"},
      {status: 500}
    );
  }
}

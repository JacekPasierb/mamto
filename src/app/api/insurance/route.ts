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

export const dynamic = "force-dynamic";

async function attachVehicleNames(
  userId: string,
  policies: Record<string, unknown>[]
) {
  const vehicleIds = policies
    .map((policy) => policy.vehicleId)
    .filter(Boolean)
    .map((id) => String(id));

  if (vehicleIds.length === 0) {
    return policies.map((policy) => ({...policy, vehicleName: null}));
  }

  const vehicles = await Vehicle.find({
    userId,
    _id: {$in: vehicleIds},
  })
    .select("name")
    .lean();

  const vehicleMap = new Map(
    vehicles.map((vehicle) => [String(vehicle._id), vehicle.name as string])
  );

  return policies.map((policy) => ({
    ...policy,
    vehicleName: policy.vehicleId
      ? vehicleMap.get(String(policy.vehicleId)) || null
      : null,
  }));
}

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const policies = await InsurancePolicy.find({userId})
      .sort({endsAt: 1, name: 1})
      .lean();

    const withVehicles = await attachVehicleNames(
      userId,
      policies as Record<string, unknown>[]
    );
    const now = todayCalendarDate();

    return NextResponse.json(
      withVehicles.map((item) =>
        enrichInsurance(
          item as Parameters<typeof enrichInsurance>[0],
          now
        )
      ),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET insurance error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać polis"},
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

    const policy = await InsurancePolicy.create({
      userId,
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
    });

    const enriched = enrichInsurance(policy.toObject(), todayCalendarDate());
    const [withVehicle] = await attachVehicleNames(userId, [
      enriched as unknown as Record<string, unknown>,
    ]);

    return NextResponse.json(
      enrichInsurance(
        withVehicle as Parameters<typeof enrichInsurance>[0],
        todayCalendarDate()
      ),
      {status: 201}
    );
  } catch (error) {
    console.error("POST insurance error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać polisy"},
      {status: 500}
    );
  }
}

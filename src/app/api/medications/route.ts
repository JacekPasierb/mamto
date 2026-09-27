import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import Medication from "@/models/Medication";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    await connectDB();

    const filter: Record<string, unknown> = {userId};

    if (query) {
      filter.name = {
        $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    const medications = await Medication.find(filter)
      .sort({lastUsedAt: -1, name: 1})
      .limit(20)
      .lean();

    return NextResponse.json(medications, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    console.error("GET medications error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać leków"},
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
    const {name} = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa leku jest wymagana"},
        {status: 400}
      );
    }

    await connectDB();

    const trimmedName = name.trim();
    const existing = await Medication.findOne({
      userId,
      name: {
        $regex: new RegExp(
          `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    });

    if (existing) {
      existing.lastUsedAt = new Date();
      await existing.save();
      return NextResponse.json(existing);
    }

    const medication = await Medication.create({
      userId,
      name: trimmedName,
      lastUsedAt: new Date(),
    });

    return NextResponse.json(medication, {status: 201});
  } catch (error) {
    console.error("POST medications error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać leku"},
      {status: 500}
    );
  }
}

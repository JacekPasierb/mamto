import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import Workshop from "@/models/Workshop";

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
      filter.name = {$regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i"};
    }

    const workshops = await Workshop.find(filter)
      .sort({lastUsedAt: -1, name: 1})
      .limit(20)
      .lean();

    return NextResponse.json(workshops, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET workshops error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać warsztatów"},
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
    const {name, address, phone} = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa warsztatu jest wymagana"},
        {status: 400}
      );
    }

    await connectDB();

    const trimmedName = name.trim();
    const existing = await Workshop.findOne({
      userId,
      name: {$regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")},
    });

    if (existing) {
      existing.lastUsedAt = new Date();

      if (address?.trim()) {
        existing.address = address.trim();
      }

      if (phone?.trim()) {
        existing.phone = phone.trim();
      }

      await existing.save();

      return NextResponse.json(existing);
    }

    const workshop = await Workshop.create({
      userId,
      name: trimmedName,
      address: address?.trim() || "",
      phone: phone?.trim() || "",
      lastUsedAt: new Date(),
    });

    return NextResponse.json(workshop, {status: 201});
  } catch (error) {
    console.error("POST workshops error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać warsztatu"},
      {status: 500}
    );
  }
}

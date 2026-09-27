import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {
  VISIT_FORM_TYPES,
  normalizeVisitType,
  type VisitFormType,
  type VisitType,
} from "@/lib/visitTypes";
import VisitProvider from "@/models/VisitProvider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const categoryParam = searchParams.get("category")?.trim() ?? "";

    await connectDB();

    const filter: Record<string, unknown> = {userId};

    if (categoryParam) {
      filter.category = normalizeVisitType(categoryParam as VisitType);
    }

    if (query) {
      filter.name = {
        $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    const providers = await VisitProvider.find(filter)
      .sort({lastUsedAt: -1, name: 1})
      .limit(20)
      .lean();

    return NextResponse.json(providers, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET visit-providers error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać listy usługodawców"},
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
    const {name, category, address, phone} = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa jest wymagana"},
        {status: 400}
      );
    }

    if (
      !category ||
      !VISIT_FORM_TYPES.includes(category as VisitFormType)
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowa kategoria"},
        {status: 400}
      );
    }

    await connectDB();

    const trimmedName = name.trim();
    const resolvedCategory = normalizeVisitType(category as VisitType);
    const existing = await VisitProvider.findOne({
      userId,
      category: resolvedCategory,
      name: {
        $regex: new RegExp(
          `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
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

    const provider = await VisitProvider.create({
      userId,
      category: resolvedCategory,
      name: trimmedName,
      address: address?.trim() || "",
      phone: phone?.trim() || "",
      lastUsedAt: new Date(),
    });

    return NextResponse.json(provider, {status: 201});
  } catch (error) {
    console.error("POST visit-providers error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać usługodawcy"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {STOCK_CATEGORIES, STOCK_UNITS} from "@/lib/stockTypes";
import StockItem from "@/models/StockItem";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const items = await StockItem.find({userId}).sort({
      name: 1,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET stock error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać zapasów"},
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
    const {name, category, quantity, unit, minQuantity, expiresAt, notes} =
      body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa jest wymagana"},
        {status: 400}
      );
    }

    if (
      category &&
      !STOCK_CATEGORIES.includes(category as (typeof STOCK_CATEGORIES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowa kategoria"},
        {status: 400}
      );
    }

    if (unit && !STOCK_UNITS.includes(unit as (typeof STOCK_UNITS)[number])) {
      return NextResponse.json(
        {message: "Nieprawidłowa jednostka"},
        {status: 400}
      );
    }

    await connectDB();

    const item = await StockItem.create({
      userId,
      name: name.trim(),
      category: category || "medicine",
      quantity: Number(quantity) || 0,
      unit: unit || "szt.",
      minQuantity: Number(minQuantity) || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes: notes?.trim() || "",
    });

    return NextResponse.json(item, {status: 201});
  } catch (error) {
    console.error("POST stock error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać zapasu"},
      {status: 500}
    );
  }
}

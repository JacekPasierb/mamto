import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichStockItem} from "@/lib/stockHelpers";
import {STOCK_CATEGORIES, STOCK_UNITS, USAGE_MODES} from "@/lib/stockTypes";
import StockItem from "@/models/StockItem";

export const dynamic = "force-dynamic";

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

    const now = todayCalendarDate();

    return NextResponse.json(
      items.map((item) => enrichStockItem(item.toObject(), now)),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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
    const {
      name,
      category,
      usageMode,
      stock,
      stockDate,
      dailyUsage,
      reminderThreshold,
      quantity,
      unit,
      minQuantity,
      expiresAt,
      notes,
    } = body;

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

    if (
      usageMode &&
      !USAGE_MODES.includes(usageMode as (typeof USAGE_MODES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy tryb zużycia"},
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

    const isDaily = usageMode === "daily";

    if (isDaily) {
      if (!stockDate) {
        return NextResponse.json(
          {message: "Data ustawienia stanu jest wymagana"},
          {status: 400}
        );
      }

      if (!dailyUsage || Number(dailyUsage) <= 0) {
        return NextResponse.json(
          {message: "Dzienne zużycie musi być większe od zera"},
          {status: 400}
        );
      }

      const item = await StockItem.create({
        userId,
        name: name.trim(),
        category: category || "medicine",
        usageMode: "daily",
        stock: Number(stock) || 0,
        stockDate: parseCalendarDate(stockDate),
        dailyUsage: Number(dailyUsage),
        reminderThreshold: Number(reminderThreshold) || 0,
        unit: unit || "tabletek",
        notes: notes?.trim() || "",
      });

      return NextResponse.json(
        enrichStockItem(item.toObject()),
        {status: 201}
      );
    }

    const item = await StockItem.create({
      userId,
      name: name.trim(),
      category: category || "medicine",
      usageMode: "static",
      quantity: Number(quantity) || 0,
      unit: unit || "szt.",
      minQuantity: Number(minQuantity) || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes: notes?.trim() || "",
    });

    return NextResponse.json(enrichStockItem(item.toObject()), {status: 201});
  } catch (error) {
    console.error("POST stock error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać zapasu"},
      {status: 500}
    );
  }
}

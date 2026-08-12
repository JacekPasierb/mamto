import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichStockItem} from "@/lib/stockHelpers";
import {STOCK_CATEGORIES, STOCK_UNITS, USAGE_MODES} from "@/lib/stockTypes";
import StockItem from "@/models/StockItem";

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

    const update = isDaily
      ? {
          name: name.trim(),
          category: category || "medicine",
          usageMode: "daily" as const,
          stock: Number(stock) || 0,
          stockDate: stockDate
            ? parseCalendarDate(stockDate)
            : todayCalendarDate(),
          dailyUsage: Number(dailyUsage) || 0,
          reminderThreshold: Number(reminderThreshold) || 0,
          unit: unit || "tabletek",
          notes: notes?.trim() || "",
        }
      : {
          name: name.trim(),
          category: category || "medicine",
          usageMode: "static" as const,
          quantity: Number(quantity) || 0,
          unit: unit || "szt.",
          minQuantity: Number(minQuantity) || 1,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          notes: notes?.trim() || "",
        };

    const item = await StockItem.findOneAndUpdate({_id: id, userId}, update, {
      new: true,
    });

    if (!item) {
      return NextResponse.json(
        {message: "Nie znaleziono zapasu"},
        {status: 404}
      );
    }

    return NextResponse.json(enrichStockItem(item.toObject(), todayCalendarDate()));
  } catch (error) {
    console.error("PUT stock error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować zapasu"},
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

    const item = await StockItem.findOneAndDelete({_id: id, userId});

    if (!item) {
      return NextResponse.json(
        {message: "Nie znaleziono zapasu"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE stock error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć zapasu"},
      {status: 500}
    );
  }
}

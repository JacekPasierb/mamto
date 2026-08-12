import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {todayCalendarDate} from "@/lib/calculateCurrentStock";
import {connectDB} from "@/lib/mongodb";
import {enrichStockItem} from "@/lib/stockHelpers";
import StockItem from "@/models/StockItem";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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
    const {stock: newAmount} = body;

    if (newAmount == null || Number(newAmount) < 0) {
      return NextResponse.json(
        {message: "Podaj poprawną ilość"},
        {status: 400}
      );
    }

    await connectDB();

    const item = await StockItem.findOne({
      _id: id,
      userId,
    });

    if (!item) {
      return NextResponse.json(
        {message: "Nie znaleziono zapasu"},
        {status: 404}
      );
    }

    const isDaily =
      item.usageMode === "daily" ||
      (item.stock != null &&
        item.stockDate != null &&
        item.dailyUsage != null &&
        Number(item.dailyUsage) > 0);

    const today = todayCalendarDate();
    const amount = Number(newAmount);

    if (isDaily) {
      if (item.usageMode !== "daily") {
        item.usageMode = "daily";
      }

      item.stock = amount;
      item.stockDate = today;
    } else {
      item.quantity = amount;
    }

    await item.save();

    return NextResponse.json(enrichStockItem(item.toObject(), today), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST stock refill error:", error);

    return NextResponse.json(
      {message: "Nie udało się uzupełnić zapasu"},
      {status: 500}
    );
  }
}

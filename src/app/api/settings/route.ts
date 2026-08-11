import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import UserSettings from "@/models/UserSettings";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    let settings = await UserSettings.findOne({userId});

    if (!settings) {
      settings = await UserSettings.create({
        userId,
        modules: {
          vehicles: true,
          insurance: true,
          beauty: false,
          stock: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać ustawień"},
      {status: 500}
    );
  }
}

export async function PUT(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const body = await request.json();

    await connectDB();

    const settings = await UserSettings.findOneAndUpdate(
      {userId},
      {
        $set: {
          modules: body.modules,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT settings error:", error);

    return NextResponse.json(
      {message: "Nie udało się zapisać ustawień"},
      {status: 500}
    );
  }
}

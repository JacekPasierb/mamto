import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import UserSettings from "@/models/UserSettings";

const DEFAULT_MODULES = {
  vehicles: true,
  insurance: true,
  documents: true,
  beauty: true,
  stock: true,
};

function normalizeModules(modules?: Partial<typeof DEFAULT_MODULES> | null) {
  return {
    vehicles: modules?.vehicles ?? DEFAULT_MODULES.vehicles,
    insurance: modules?.insurance ?? DEFAULT_MODULES.insurance,
    documents: modules?.documents ?? DEFAULT_MODULES.documents,
    beauty: modules?.beauty ?? DEFAULT_MODULES.beauty,
    stock: modules?.stock ?? DEFAULT_MODULES.stock,
  };
}

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
        modules: DEFAULT_MODULES,
      });
    } else {
      const moduleFixes: Record<string, boolean> = {};

      if (settings.modules?.documents === undefined) {
        moduleFixes["modules.documents"] = true;
      }

      if (settings.modules?.beauty === undefined) {
        moduleFixes["modules.beauty"] = true;
      }

      if (Object.keys(moduleFixes).length > 0) {
        settings = await UserSettings.findOneAndUpdate(
          {userId},
          {$set: moduleFixes},
          {new: true}
        );
      }
    }

    const plain = settings!.toObject();

    return NextResponse.json({
      ...plain,
      modules: normalizeModules(plain.modules),
    });
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

    const modules = normalizeModules(body.modules);

    const settings = await UserSettings.findOneAndUpdate(
      {userId},
      {
        $set: {
          modules,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({
      ...settings.toObject(),
      modules,
    });
  } catch (error) {
    console.error("PUT settings error:", error);

    return NextResponse.json(
      {message: "Nie udało się zapisać ustawień"},
      {status: 500}
    );
  }
}

import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {buildRemindersForUser} from "@/lib/buildReminders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const payload = await buildRemindersForUser(userId);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET reminders error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać przypomnień"},
      {status: 500}
    );
  }
}

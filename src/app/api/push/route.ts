import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {getVapidPublicKey} from "@/lib/webPush";
import PushSubscription from "@/models/PushSubscription";
import UserSettings from "@/models/UserSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return NextResponse.json(
        {message: "Powiadomienia nie są skonfigurowane na serwerze"},
        {status: 503}
      );
    }

    await connectDB();

    const settings = await UserSettings.findOne({userId}).lean();
    const count = await PushSubscription.countDocuments({userId});

    return NextResponse.json({
      publicKey,
      pushEnabled: Boolean(settings?.notifications?.pushEnabled),
      subscriptionCount: count,
      supportedHint:
        "Na iPhonie dodaj MamTo do ekranu początkowego (Udostępnij → Do ekranu początkowego).",
    });
  } catch (error) {
    console.error("GET push error:", error);
    return NextResponse.json(
      {message: "Nie udało się pobrać statusu powiadomień"},
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
    const endpoint = body?.endpoint?.trim();
    const p256dh = body?.keys?.p256dh?.trim();
    const authKey = body?.keys?.auth?.trim();
    const userAgent =
      typeof body?.userAgent === "string" ? body.userAgent.slice(0, 400) : "";

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json(
        {message: "Nieprawidłowa subskrypcja push"},
        {status: 400}
      );
    }

    await connectDB();

    await PushSubscription.findOneAndUpdate(
      {endpoint},
      {
        userId,
        endpoint,
        keys: {p256dh, auth: authKey},
        userAgent,
      },
      {upsert: true, new: true, setDefaultsOnInsert: true}
    );

    await UserSettings.findOneAndUpdate(
      {userId},
      {
        $set: {"notifications.pushEnabled": true},
        $setOnInsert: {userId},
      },
      {upsert: true}
    );

    return NextResponse.json({ok: true, pushEnabled: true});
  } catch (error) {
    console.error("POST push error:", error);
    return NextResponse.json(
      {message: "Nie udało się zapisać subskrypcji"},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const body = await request.json().catch(() => ({}));
    const endpoint =
      typeof body?.endpoint === "string" ? body.endpoint.trim() : "";

    await connectDB();

    if (endpoint) {
      await PushSubscription.deleteOne({userId, endpoint});
    } else {
      await PushSubscription.deleteMany({userId});
    }

    const remaining = await PushSubscription.countDocuments({userId});

    if (remaining === 0) {
      await UserSettings.findOneAndUpdate(
        {userId},
        {$set: {"notifications.pushEnabled": false}}
      );
    }

    return NextResponse.json({
      ok: true,
      pushEnabled: remaining > 0,
      subscriptionCount: remaining,
    });
  } catch (error) {
    console.error("DELETE push error:", error);
    return NextResponse.json(
      {message: "Nie udało się wyłączyć powiadomień"},
      {status: 500}
    );
  }
}

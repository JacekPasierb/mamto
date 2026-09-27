import {NextResponse} from "next/server";

import {connectDB} from "@/lib/mongodb";
import {dispatchUrgentPushNotifications} from "@/lib/dispatchUrgentPush";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") || "";

  return bearer === secret || query === secret;
}

export async function GET(request: Request) {
  return runCron(request);
}

export async function POST(request: Request) {
  return runCron(request);
}

async function runCron(request: Request) {
  try {
    if (!authorizeCron(request)) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    await connectDB();
    const result = await dispatchUrgentPushNotifications();

    return NextResponse.json({
      ok: true,
      ...result,
      at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("cron push-urgent error:", error);
    return NextResponse.json(
      {message: "Nie udało się wysłać powiadomień"},
      {status: 500}
    );
  }
}

import webpush from "web-push";

let configured = false;

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";
}

export function configureWebPush() {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    "mailto:kontakt@pasierb-webstudio.pl";

  if (!publicKey || !privateKey) {
    throw new Error("Brak VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY w env");
  }

  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }

  return webpush;
}

export type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function sendWebPush(
  subscription: PushSubscriptionJSON,
  payload: {
    title: string;
    body: string;
    url?: string;
  }
) {
  const push = configureWebPush();

  await push.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/dashboard",
    }),
    {
      TTL: 60 * 60 * 12,
      urgency: "normal",
    }
  );
}

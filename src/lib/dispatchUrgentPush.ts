import {buildRemindersForUser} from "@/lib/buildReminders";
import {sendWebPush} from "@/lib/webPush";
import PushSubscription from "@/models/PushSubscription";
import UserSettings from "@/models/UserSettings";

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function buildDigest(summary: {
  overdueCount: number;
  attentionCount: number;
}) {
  return `${todayKey()}:${summary.overdueCount}:${summary.attentionCount}`;
}

function buildMessage(summary: {
  overdueCount: number;
  attentionCount: number;
}) {
  if (summary.overdueCount > 0) {
    const n = summary.overdueCount;
    return {
      title: "MamTo — sprawy po terminie",
      body:
        n === 1
          ? "Masz 1 sprawę po terminie."
          : `Masz ${n} spraw po terminie.`,
    };
  }

  const n = summary.attentionCount;
  return {
    title: "MamTo — warto zerknąć",
    body:
      n === 1
        ? "1 rzecz wymaga uwagi."
        : `${n} rzeczy wymaga uwagi.`,
  };
}

/** Wysyła push o pilnych sprawach do użytkowników z włączonymi powiadomieniami. */
export async function dispatchUrgentPushNotifications() {
  const settings = await UserSettings.find({
    "notifications.pushEnabled": true,
  })
    .select("userId")
    .lean();

  const userIds = settings.map((item) => item.userId);
  if (userIds.length === 0) {
    return {users: 0, sent: 0, skipped: 0, failed: 0};
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const userId of userIds) {
    const subscriptions = await PushSubscription.find({userId});
    if (subscriptions.length === 0) {
      skipped += 1;
      continue;
    }

    let summary;
    try {
      const reminders = await buildRemindersForUser(userId);
      summary = reminders.summary;
    } catch (error) {
      console.error("reminders for push failed", userId, error);
      failed += 1;
      continue;
    }

    if (summary.attentionCount <= 0 && summary.overdueCount <= 0) {
      skipped += 1;
      continue;
    }

    const digest = buildDigest(summary);
    const message = buildMessage(summary);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "https://mam-to.netlify.app";

    for (const sub of subscriptions) {
      if (sub.lastDigest === digest) {
        skipped += 1;
        continue;
      }

      try {
        if (!sub.keys?.p256dh || !sub.keys?.auth) {
          failed += 1;
          continue;
        }

        await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          {
            title: message.title,
            body: message.body,
            url: `${appUrl}/dashboard`,
          }
        );

        sub.lastDigest = digest;
        sub.lastNotifiedAt = new Date();
        await sub.save();
        sent += 1;
      } catch (error: unknown) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as {statusCode?: number}).statusCode)
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({_id: sub._id});
        } else {
          console.error("web push send failed", sub.endpoint, error);
        }
        failed += 1;
      }
    }
  }

  return {users: userIds.length, sent, skipped, failed};
}

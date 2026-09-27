/**
 * Netlify Scheduled Function — woła Next API z CRON_SECRET.
 * Wymaga env: CRON_SECRET, URL (opcjonalnie NEXT_PUBLIC_APP_URL / URL / DEPLOY_PRIME_URL).
 */
export default async () => {
  const secret = process.env.CRON_SECRET;
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "https://mam-to.netlify.app";

  if (!secret) {
    return new Response("Missing CRON_SECRET", {status: 500});
  }

  const response = await fetch(
    `${base.replace(/\/$/, "")}/api/cron/push-urgent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: {"Content-Type": "application/json"},
  });
};

export const config = {
  // 6:00 UTC → ~7:00 PL zimą / ~8:00 PL latem
  schedule: "0 6 * * *",
};

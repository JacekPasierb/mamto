self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "MamTo",
    body: "Masz sprawy wymagające uwagi.",
    url: "/dashboard",
  };

  try {
    if (event.data) {
      data = {...data, ...event.data.json()};
    }
  } catch {
    // ignore malformed payload
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "MamTo", {
      body: data.body || "",
      icon: "/mamto-logo.png",
      badge: "/mamto-mark.svg",
      data: {url: data.url || "/dashboard"},
      tag: "mamto-urgent",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});

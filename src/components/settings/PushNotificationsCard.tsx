"use client";

import Link from "next/link";
import {useCallback, useEffect, useState} from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}

type PushStatus = {
  publicKey: string;
  pushEnabled: boolean;
  subscriptionCount: number;
  supportedHint: string;
};

const PushNotificationsCard = () => {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );

  const supported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/push", {cache: "no-store"});
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "Nie udało się pobrać statusu");
    }
    const data = await response.json();
    setStatus(data);
  }, []);

  useEffect(() => {
    if (!supported) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    loadStatus().catch((err) => {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Nie udało się pobrać statusu."
      );
    });
  }, [supported, loadStatus]);

  const enable = async () => {
    if (!supported || !status?.publicKey) {
      setError("Ta przeglądarka nie obsługuje Web Push albo brakuje kluczy VAPID.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setInfo("");

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        setError("Aby dostać powiadomienia, zaakceptuj je w przeglądarce.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(status.publicKey),
        }));

      const json = subscription.toJSON();
      const response = await fetch("/api/push", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Nie udało się włączyć powiadomień");
      }

      await loadStatus();
      setInfo(
        "Powiadomienia włączone. Pilne sprawy dostaniesz na telefon (Android) lub iPhone po dodaniu MamTo do ekranu początkowego."
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Nie udało się włączyć powiadomień."
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    try {
      setBusy(true);
      setError("");
      setInfo("");

      let endpoint: string | undefined;

      if (supported) {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription =
          await registration?.pushManager.getSubscription();
        endpoint = subscription?.endpoint;
        await subscription?.unsubscribe();
      }

      const response = await fetch("/api/push", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({endpoint}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Nie udało się wyłączyć powiadomień");
      }

      await loadStatus();
      setInfo("Powiadomienia wyłączone na tym urządzeniu.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się wyłączyć powiadomień."
      );
    } finally {
      setBusy(false);
    }
  };

  const enabled = Boolean(status?.pushEnabled);

  return (
    <div className="mt-12 border-t border-[var(--mt-line)] pt-8">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
        Powiadomienia
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-lg tracking-tight">
            Push na telefon
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--mt-muted)]">
            Dostaniesz przypomnienie o sprawach po terminie i pilnych
            terminach. Działa w Chrome na Androidzie; na iPhonie po dodaniu
            MamTo do ekranu początkowego.
          </p>
          {permission === "unsupported" ? (
            <p className="mt-2 text-sm text-[var(--mt-signal)]">
              Ta przeglądarka nie obsługuje Web Push.
            </p>
          ) : null}
          {status?.supportedHint && permission !== "unsupported" ? (
            <p className="mt-2 text-xs text-[var(--mt-muted)]">
              {status.supportedHint}{" "}
              <Link
                href="/poradnik#powiadomienia"
                className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
              >
                Zobacz poradnik
              </Link>
            </p>
          ) : null}
          {info ? (
            <p className="mt-2 text-sm text-[var(--mt-accent)]">{info}</p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={busy || permission === "unsupported" || !status}
          onClick={() => (enabled ? disable() : enable())}
          aria-pressed={enabled}
          className={`relative h-7 w-12 shrink-0 self-start transition disabled:opacity-40 ${
            enabled ? "bg-[var(--mt-accent)]" : "bg-[var(--mt-bg-deep)]"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 bg-white transition-all ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      {busy ? (
        <p className="mt-3 text-sm text-[var(--mt-muted)]">Zapisywanie…</p>
      ) : null}
    </div>
  );
};

export default PushNotificationsCard;

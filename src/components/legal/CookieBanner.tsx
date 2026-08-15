"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

const STORAGE_KEY = "mamto-cookie-consent";

type ConsentValue = "accepted" | "rejected";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--mt-line)] bg-white/95 px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(16,20,26,0.35)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-lg tracking-tight">Cookies</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--mt-muted)]">
            Używamy niezbędnych plików cookies do logowania i bezpieczeństwa.
            Opcjonalne włączymy dopiero po zgodzie. Szczegóły:{" "}
            <Link
              href="/cookies"
              className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
            >
              Polityka cookies
            </Link>{" "}
            i{" "}
            <Link
              href="/polityka-prywatnosci"
              className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
            >
              Polityka prywatności
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save("rejected")}
            className="border border-[var(--mt-line)] px-4 py-2.5 text-sm font-semibold text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)]"
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="bg-[var(--mt-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

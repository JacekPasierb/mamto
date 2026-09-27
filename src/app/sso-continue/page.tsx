"use client";

import Link from "next/link";
import {useSignUp} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function SsoContinuePage() {
  const {signUp, fetchStatus} = useSignUp();
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!signUp) {
      setError("Sesja rejestracji wygasła. Zacznij ponownie.");
      return;
    }

    if (!acceptedTerms) {
      setError("Zaakceptuj regulamin i politykę prywatności.");
      return;
    }

    try {
      const payload: {
        legalAccepted: boolean;
        firstName?: string;
      } = {
        legalAccepted: true,
      };

      const trimmed = firstName.trim();
      if (trimmed) payload.firstName = trimmed;

      const {error: updateError} = await signUp.update(payload);

      if (updateError) {
        console.error(updateError);
        setError(
          updateError.message || "Nie udało się dokończyć rejestracji."
        );
        return;
      }

      if (signUp.status === "complete") {
        const {error: finalizeError} = await signUp.finalize({
          navigate: ({session, decorateUrl}) => {
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }

            const url = decorateUrl("/dashboard");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });

        if (finalizeError) {
          setError(
            finalizeError.message || "Nie udało się aktywować sesji."
          );
        }
        return;
      }

      setError("Uzupełnij brakujące dane, aby dokończyć rejestrację.");
    } catch (err) {
      console.error(err);
      setError("Nie udało się dokończyć rejestracji.");
    }
  };

  if (!signUp) {
    return (
      <main className="mt-atmosphere flex min-h-screen items-center justify-center px-6">
        <p className="text-[var(--mt-muted)]">Ładowanie…</p>
      </main>
    );
  }

  return (
    <main className="mt-atmosphere flex min-h-screen items-center justify-center px-6 text-[var(--mt-ink)]">
      <div className="mt-stage w-full max-w-md border border-[var(--mt-line)] bg-white/70 p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
          Google
        </p>
        <h1 className="font-display mt-3 text-3xl tracking-tight">
          Dokończ konto
        </h1>
        <p className="mt-2 text-sm text-[var(--mt-muted)]">
          Jeszcze jeden krok, zanim wejdziesz do MamTo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {(signUp.missingFields?.includes("first_name") ||
            !signUp.firstName) && (
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm text-[var(--mt-muted)]"
              >
                Imię
              </label>
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]"
              />
            </div>
          )}

          <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--mt-muted)]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--mt-accent)]"
              required
            />
            <span>
              Akceptuję{" "}
              <Link
                href="/regulamin"
                className="font-medium text-[var(--mt-ink)] underline-offset-4 hover:underline"
                target="_blank"
              >
                Regulamin
              </Link>{" "}
              oraz{" "}
              <Link
                href="/polityka-prywatnosci"
                className="font-medium text-[var(--mt-ink)] underline-offset-4 hover:underline"
                target="_blank"
              >
                Politykę prywatności
              </Link>
              .
            </span>
          </label>

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={fetchStatus === "fetching" || !acceptedTerms}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {fetchStatus === "fetching" ? "Zapisuję…" : "Kontynuuj"}
          </button>
        </form>

        <div id="clerk-captcha" className="mt-4" />
      </div>
    </main>
  );
}

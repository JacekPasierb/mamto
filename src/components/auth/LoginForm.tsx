"use client";

import Link from "next/link";
import {useClerk, useSignIn} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import AuthShell from "./AuthShell";

const fieldClass =
  "w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

const clerkMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;

  const record = error as Record<string, unknown>;

  if (Array.isArray(record.errors) && record.errors[0]) {
    const first = record.errors[0] as Record<string, unknown>;
    if (typeof first.longMessage === "string" && first.longMessage) {
      return first.longMessage;
    }
    if (typeof first.message === "string" && first.message) {
      return first.message;
    }
  }

  if (typeof record.message === "string" && record.message) {
    return record.message;
  }

  return fallback;
};

const LoginForm = () => {
  const {signIn, errors, fetchStatus} = useSignIn();
  const {client} = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const finalizeSignIn = async () => {
    if (!signIn) return;

    const {error: finalizeError} = await signIn.finalize({
      navigate: ({session, decorateUrl}) => {
        if (session?.currentTask) {
          console.log("Session task:", session.currentTask);
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
      console.error(finalizeError);
      setError(clerkMessage(finalizeError, "Nie udało się dokończyć logowania."));
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleBusy(true);

    try {
      const origin = window.location.origin;

      await client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${origin}/sso-callback`,
        redirectUrlComplete: `${origin}/dashboard`,
      });
    } catch (err) {
      console.error(err);
      setError(clerkMessage(err, "Nie udało się zalogować przez Google."));
      setGoogleBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!signIn) {
      setError("Logowanie jeszcze się ładuje. Spróbuj za chwilę.");
      return;
    }

    try {
      const {error: passwordError} = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (passwordError) {
        console.error(passwordError);
        setError(
          clerkMessage(
            passwordError,
            errors.fields.password?.message ||
              errors.fields.identifier?.message ||
              "Nieprawidłowy email lub hasło."
          )
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
      } else {
        console.error("Sign-in not complete:", signIn.status, signIn);
        setError(
          "Logowanie wymaga dodatkowego kroku. Sprawdź ustawienia MFA w Clerk."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Nieprawidłowy email lub hasło.");
    }
  };

  return (
    <AuthShell
      eyebrow="Logowanie"
      title="Witaj z powrotem."
      description="Wejdź do swojego organizera — pojazdy, polisy, leki i wizyty czekają."
    >
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
          Konto
        </p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">
          Zaloguj się
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm text-[var(--mt-muted)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@email.pl"
            autoComplete="email"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm text-[var(--mt-muted)]"
            >
              Hasło
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
            >
              Przypomnij hasło
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--mt-muted)] transition hover:text-[var(--mt-ink)]"
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 3l18 18M10.5 10.7a2.5 2.5 0 0 0 3.8 3.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="square"
                  />
                  <path
                    d="M9.2 5.6A10.5 10.5 0 0 1 12 5.2c5.2 0 9.2 4.2 10.5 6.8-.5 1-1.5 2.5-3.1 3.9M6.4 6.9C4.4 8.3 3.1 10 2.5 12c1.3 2.6 5.3 6.8 10.5 6.8 1.1 0 2.2-.2 3.2-.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2.5 12C3.8 9.4 7.8 5.2 12 5.2s8.2 4.2 9.5 6.8c-1.3 2.6-5.3 6.8-9.5 6.8S3.8 14.6 2.5 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="miter"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-[var(--mt-signal)]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={fetchStatus === "fetching" || !signIn}
          className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
        >
          {fetchStatus === "fetching" ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--mt-line)]" />
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--mt-muted)]">
          lub
        </span>
        <div className="h-px flex-1 bg-[var(--mt-line)]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={fetchStatus === "fetching" || googleBusy || !signIn}
        className="w-full border border-[var(--mt-line)] bg-white/50 px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-accent)] disabled:opacity-50"
      >
        {googleBusy ? "Przekierowuję…" : "Kontynuuj z Google"}
      </button>

      <p className="mt-7 text-sm text-[var(--mt-muted)]">
        Nie masz konta?{" "}
        <Link
          href="/register"
          className="font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
        >
          Załóż konto
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginForm;

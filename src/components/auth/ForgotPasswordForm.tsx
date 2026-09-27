"use client";

import Link from "next/link";
import {useSignIn} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import AuthShell from "./AuthShell";

const fieldClass =
  "w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

const MIN_PASSWORD_LENGTH = 15;

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

const ForgotPasswordForm = () => {
  const {signIn, errors, fetchStatus} = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const busy = fetchStatus === "fetching";
  const needsNewPassword = signIn?.status === "needs_new_password";

  const finalizeSignIn = async () => {
    if (!signIn) return;

    const {error: finalizeError} = await signIn.finalize({
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
      setError(clerkMessage(finalizeError, "Nie udało się zalogować."));
    }
  };

  const sendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!signIn) {
      setError("Formularz jeszcze się ładuje. Spróbuj za chwilę.");
      return;
    }

    try {
      const {error: createError} = await signIn.create({
        identifier: email.trim(),
      });

      if (createError) {
        setError(
          clerkMessage(
            createError,
            errors.fields.identifier?.message ||
              "Nie udało się znaleźć konta dla tego adresu."
          )
        );
        return;
      }

      const {error: sendError} = await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setError(
          clerkMessage(sendError, "Nie udało się wysłać kodu resetującego.")
        );
        return;
      }

      setCodeSent(true);
      setInfo("Wysłaliśmy kod resetujący na podany adres email.");
    } catch (err) {
      console.error(err);
      setError(clerkMessage(err, "Nie udało się wysłać kodu resetującego."));
    }
  };

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!signIn) return;

    try {
      const {error: verifyError} =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: code.trim(),
        });

      if (verifyError) {
        setError(
          clerkMessage(
            verifyError,
            errors.fields.code?.message || "Nieprawidłowy kod."
          )
        );
        return;
      }

      setInfo("Kod poprawny. Ustaw nowe hasło.");
    } catch (err) {
      console.error(err);
      setError(clerkMessage(err, "Nie udało się zweryfikować kodu."));
    }
  };

  const submitNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!signIn) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }

    try {
      const {error: passwordError} =
        await signIn.resetPasswordEmailCode.submitPassword({
          password,
          signOutOfOtherSessions: true,
        });

      if (passwordError) {
        setError(
          clerkMessage(
            passwordError,
            errors.fields.password?.message ||
              "Nie udało się ustawić nowego hasła."
          )
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      setError("Reset hasła wymaga dodatkowego kroku. Spróbuj zalogować się ponownie.");
    } catch (err) {
      console.error(err);
      setError(clerkMessage(err, "Nie udało się ustawić nowego hasła."));
    }
  };

  if (!codeSent) {
    return (
      <AuthShell
        eyebrow="Hasło"
        title="Przypomnij hasło."
        description="Podaj email konta — wyślemy jednorazowy kod do ustawienia nowego hasła."
      >
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Reset
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">
            Odzyskaj dostęp
          </h2>
        </div>

        <form onSubmit={sendCode} className="mt-8 space-y-5">
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

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !signIn}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {busy ? "Wysyłam…" : "Wyślij kod"}
          </button>
        </form>

        <p className="mt-7 text-sm text-[var(--mt-muted)]">
          Pamiętasz hasło?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
          >
            Zaloguj się
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (needsNewPassword) {
    return (
      <AuthShell
        eyebrow="Hasło"
        title="Nowe hasło."
        description="Ustaw hasło, którym będziesz logować się do MamTo."
      >
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Reset
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">
            Ustaw hasło
          </h2>
        </div>

        <form onSubmit={submitNewPassword} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-[var(--mt-muted)]"
            >
              Nowe hasło
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
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
                {showPassword ? "Ukryj" : "Pokaż"}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--mt-muted)]">
              Minimum {MIN_PASSWORD_LENGTH} znaków.
            </p>
          </div>

          {info ? (
            <p className="text-sm text-[var(--mt-muted)]">{info}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy || password.length < MIN_PASSWORD_LENGTH}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {busy ? "Zapisuję…" : "Zapisz hasło i zaloguj"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Hasło"
      title="Sprawdź skrzynkę."
      description="Wpisz kod z emaila, aby przejść do ustawienia nowego hasła."
    >
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
          Reset
        </p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">
          Potwierdź kod
        </h2>
        <p className="mt-2 text-sm text-[var(--mt-muted)]">
          Kod poszedł na{" "}
          <span className="font-medium text-[var(--mt-ink)]">{email}</span>
        </p>
      </div>

      <form onSubmit={verifyCode} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="code"
            className="mb-2 block text-sm text-[var(--mt-muted)]"
          >
            Kod resetujący
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            autoComplete="one-time-code"
            required
            className={fieldClass}
          />
        </div>

        {info ? <p className="text-sm text-[var(--mt-muted)]">{info}</p> : null}
        {error ? (
          <p className="text-sm text-[var(--mt-signal)]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
        >
          {busy ? "Sprawdzam…" : "Potwierdź kod"}
        </button>

        <button
          type="button"
          onClick={async () => {
            setError("");
            setInfo("");
            if (!signIn) return;
            const {error: resendError} =
              await signIn.resetPasswordEmailCode.sendCode();
            if (resendError) {
              setError(
                clerkMessage(resendError, "Nie udało się wysłać nowego kodu.")
              );
              return;
            }
            setInfo("Wysłaliśmy nowy kod.");
          }}
          disabled={busy}
          className="w-full text-sm text-[var(--mt-muted)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline disabled:opacity-50"
        >
          Wyślij nowy kod
        </button>
      </form>

      <p className="mt-7 text-sm text-[var(--mt-muted)]">
        <Link
          href="/login"
          className="font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
        >
          ← Wróć do logowania
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordForm;

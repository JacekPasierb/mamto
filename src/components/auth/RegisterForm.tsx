"use client";

import Link from "next/link";
import {useAuth, useClerk, useSignUp} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import AuthShell from "./AuthShell";

const fieldClass =
  "w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

const SIGNUP_TIMEOUT_MS = 25_000;
const MIN_PASSWORD_LENGTH = 15;

const translateClerkMessage = (message: string) => {
  if (/passwords must be 15 characters or more/i.test(message)) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  }

  if (/password is too short/i.test(message)) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  }

  return message;
};

const clerkMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") {
    return translateClerkMessage(fallback);
  }

  const record = error as Record<string, unknown>;

  if (Array.isArray(record.errors) && record.errors[0]) {
    const first = record.errors[0] as Record<string, unknown>;
    if (typeof first.longMessage === "string" && first.longMessage) {
      return translateClerkMessage(first.longMessage);
    }
    if (typeof first.message === "string" && first.message) {
      return translateClerkMessage(first.message);
    }
  }

  if (typeof record.longMessage === "string" && record.longMessage) {
    return translateClerkMessage(record.longMessage);
  }

  if (typeof record.message === "string" && record.message) {
    return translateClerkMessage(record.message);
  }

  return translateClerkMessage(fallback);
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const ClerkCaptcha = () => (
  <div
    id="clerk-captcha"
    data-cl-theme="light"
    data-cl-size="flexible"
    className="min-h-[4.5rem] w-full"
  />
);

const RegisterForm = () => {
  const {signUp, errors, fetchStatus} = useSignUp();
  const {isSignedIn} = useAuth();
  const {client} = useClerk();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const busy = isSubmitting || fetchStatus === "fetching";

  const needsEmailVerification =
    awaitingCode ||
    (signUp?.status === "missing_requirements" &&
      (signUp.unverifiedFields?.includes("email_address") ?? false) &&
      (signUp.missingFields?.length ?? 0) === 0);

  const finalizeSignUp = async () => {
    if (!signUp) return;

    const {error: finalizeError} = await signUp.finalize({
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
      setError(
        clerkMessage(finalizeError, "Nie udało się dokończyć rejestracji.")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!signUp) {
      setError("Rejestracja jeszcze się ładuje. Spróbuj za chwilę.");
      return;
    }

    if (!acceptedTerms) {
      setError("Zaakceptuj regulamin i politykę prywatności.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        emailAddress: string;
        password: string;
        legalAccepted: boolean;
        firstName?: string;
      } = {
        emailAddress: email.trim(),
        password,
        legalAccepted: true,
      };

      const trimmedName = firstName.trim();
      if (trimmedName) {
        payload.firstName = trimmedName;
      }

      const {error: signUpError} = await withTimeout(
        signUp.password(payload),
        SIGNUP_TIMEOUT_MS,
        "CAPTCHA_TIMEOUT"
      );

      if (signUpError) {
        console.error(signUpError);
        setError(
          clerkMessage(
            signUpError,
            errors.fields.password?.message ||
              errors.fields.emailAddress?.message ||
              errors.fields.captcha?.message ||
              "Nie udało się utworzyć konta."
          )
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      const missing = signUp.missingFields ?? [];
      if (missing.length > 0) {
        const labels = missing
          .map((field) => {
            if (field === "first_name") return "imię";
            if (field === "last_name") return "nazwisko";
            return field;
          })
          .join(", ");
        setError(`Uzupełnij wymagane pola: ${labels}.`);
        return;
      }

      if (signUp.unverifiedFields?.includes("email_address")) {
        const {error: verificationError} =
          await signUp.verifications.sendEmailCode();

        if (verificationError) {
          console.error(verificationError);
          setError(
            clerkMessage(
              verificationError,
              "Nie udało się wysłać kodu weryfikacyjnego."
            )
          );
          return;
        }

        setAwaitingCode(true);
        return;
      }

      console.error("Sign-up stuck:", signUp.status, signUp);
      setError("Nie udało się dokończyć rejestracji. Sprawdź ustawienia Clerk.");
    } catch (err) {
      console.error(err);

      if (err instanceof Error && err.message === "CAPTCHA_TIMEOUT") {
        setError(
          "Rejestracja zawisła na weryfikacji bezpieczeństwa (CAPTCHA). Odśwież stronę, wyłącz blokowanie reklam i spróbuj ponownie. Na czas developmentu możesz też wyłączyć Bot sign-up protection w Clerk Dashboard → Protect → Rules."
        );
        return;
      }

      setError(clerkMessage(err, "Wystąpił błąd podczas rejestracji."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!signUp) {
      setError("Rejestracja jeszcze się ładuje. Spróbuj za chwilę.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {error: verifyError} = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (verifyError) {
        console.error(verifyError);
        setError(
          clerkMessage(
            verifyError,
            errors.fields.code?.message || "Nieprawidłowy kod weryfikacyjny."
          )
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
      } else {
        console.error("Sign-up not complete:", signUp.status, signUp);
        setError(
          "Konto nie zostało w pełni utworzone. Sprawdź wymagane pola w ustawieniach Clerk."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się zweryfikować konta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    if (!acceptedTerms) {
      setError(
        "Aby kontynuować z Google, zaakceptuj regulamin i politykę prywatności."
      );
      document
        .getElementById("terms-acceptance")
        ?.scrollIntoView({behavior: "smooth", block: "center"});
      return;
    }

    setIsSubmitting(true);

    try {
      const origin = window.location.origin;

      await client.signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${origin}/sso-callback`,
        redirectUrlComplete: `${origin}/dashboard`,
        legalAccepted: true,
      });
    } catch (err) {
      console.error(err);
      setError(clerkMessage(err, "Nie udało się kontynuować przez Google."));
      setIsSubmitting(false);
    }
  };

  if (isSignedIn || signUp?.status === "complete") {
    return null;
  }

  if (needsEmailVerification) {
    return (
      <AuthShell
        eyebrow="Weryfikacja"
        title="Sprawdź skrzynkę."
        description="Wysłaliśmy jednorazowy kod. Po potwierdzeniu przejdziesz prosto do pulpitu."
      >
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Kod email
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">
            Potwierdź konto
          </h2>
          <p className="mt-2 text-sm text-[var(--mt-muted)]">
            Kod poszedł na{" "}
            <span className="font-medium text-[var(--mt-ink)]">
              {email || "podany adres"}
            </span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm text-[var(--mt-muted)]"
            >
              Kod weryfikacyjny
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
            {errors.fields.code?.message ? (
              <p className="mt-2 text-sm text-[var(--mt-signal)]">
                {errors.fields.code.message}
              </p>
            ) : null}
          </div>

          <ClerkCaptcha />

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {busy ? "Sprawdzam…" : "Potwierdź konto"}
          </button>

          <button
            type="button"
            onClick={async () => {
              setError("");
              const {error: resendError} =
                await signUp.verifications.sendEmailCode();
              if (resendError) {
                setError(
                  clerkMessage(
                    resendError,
                    "Nie udało się wysłać nowego kodu."
                  )
                );
              }
            }}
            disabled={busy}
            className="w-full text-sm text-[var(--mt-muted)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline disabled:opacity-50"
          >
            Wyślij nowy kod
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Rejestracja"
      title="Zacznij pilnować życia."
      description="Załóż konto i zbierz pojazdy, polisy, leki oraz wizyty w jednym spokojnym miejscu."
    >
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
          Nowe konto
        </p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">
          Załóż MamTo
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm text-[var(--mt-muted)]"
          >
            Imię
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            placeholder="Jacek"
            className={fieldClass}
          />
          {errors.fields.firstName?.message ? (
            <p className="mt-2 text-sm text-[var(--mt-signal)]">
              {errors.fields.firstName.message}
            </p>
          ) : null}
        </div>

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
            autoComplete="email"
            placeholder="jan@email.pl"
            required
            className={fieldClass}
          />
          {errors.fields.emailAddress?.message ? (
            <p className="mt-2 text-sm text-[var(--mt-signal)]">
              {errors.fields.emailAddress.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm text-[var(--mt-muted)]"
          >
            Hasło
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="•••••••••••••••"
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
          <p className="mt-2 text-xs text-[var(--mt-muted)]">
            Minimum {MIN_PASSWORD_LENGTH} znaków (wymóg ustawień Clerk).
          </p>
          {errors.fields.password?.message ? (
            <p className="mt-2 text-sm text-[var(--mt-signal)]">
              {translateClerkMessage(errors.fields.password.message)}
            </p>
          ) : null}
        </div>

        <label
          id="terms-acceptance"
          className={`flex items-start gap-3 text-sm leading-relaxed ${
            error.toLowerCase().includes("regulamin")
              ? "text-[var(--mt-signal)]"
              : "text-[var(--mt-muted)]"
          }`}
        >
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              if (e.target.checked) setError("");
            }}
            className="mt-1 h-4 w-4 accent-[var(--mt-accent)]"
            required
          />
          <span>
            Akceptuję{" "}
            <Link
              href="/regulamin"
              className="font-medium text-[var(--mt-ink)] underline-offset-4 hover:text-[var(--mt-accent)] hover:underline"
              target="_blank"
            >
              Regulamin
            </Link>{" "}
            oraz{" "}
            <Link
              href="/polityka-prywatnosci"
              className="font-medium text-[var(--mt-ink)] underline-offset-4 hover:text-[var(--mt-accent)] hover:underline"
              target="_blank"
            >
              Politykę prywatności
            </Link>
            .
          </span>
        </label>

        {/* Musi być w DOM przed signUp.password — Turnstile/Clerk bot protection */}
        <ClerkCaptcha />

        {error ? (
          <p className="text-sm leading-relaxed text-[var(--mt-signal)]">
            {error}
          </p>
        ) : null}

        {busy ? (
          <p className="text-sm text-[var(--mt-muted)]">
            Trwa weryfikacja bezpieczeństwa. Jeśli pojawi się okienko CAPTCHA —
            dokończ je.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            busy ||
            !acceptedTerms ||
            !signUp ||
            password.length < MIN_PASSWORD_LENGTH
          }
          className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
        >
          {busy ? "Tworzę konto…" : "Załóż konto"}
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
        disabled={busy || !signUp}
        className="w-full border border-[var(--mt-line)] bg-white/50 px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-accent)] disabled:opacity-50"
      >
        {busy ? "Przekierowuję…" : "Kontynuuj z Google"}
      </button>

      {error ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--mt-signal)]">
          {error}
        </p>
      ) : null}

      <p className="mt-7 text-sm text-[var(--mt-muted)]">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
        >
          Zaloguj się
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterForm;

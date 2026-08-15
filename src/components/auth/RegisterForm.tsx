"use client";

import Link from "next/link";
import {useSignUp} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import AuthShell from "./AuthShell";

const fieldClass =
  "w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

const RegisterForm = () => {
  const {signUp, fetchStatus} = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Zaakceptuj regulamin i politykę prywatności.");
      return;
    }

    try {
      const {error: signUpError} = await signUp.password({
        emailAddress: email,
        password,
        firstName,
      });

      if (signUpError) {
        console.error(signUpError);
        setError("Nie udało się utworzyć konta.");
        return;
      }

      const {error: verificationError} =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        console.error(verificationError);
        setError("Nie udało się wysłać kodu weryfikacyjnego.");
        return;
      }

      setShowVerification(true);
    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas rejestracji.");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const {error: verifyError} = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (verifyError) {
        console.error(verifyError);
        setError("Nieprawidłowy kod weryfikacyjny.");
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
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
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się zweryfikować konta.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    if (!acceptedTerms) {
      setError("Zaakceptuj regulamin i politykę prywatności.");
      return;
    }

    try {
      const {error: ssoError} = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectCallbackUrl: "/register",
      });

      if (ssoError) {
        console.error(ssoError);
        setError("Nie udało się kontynuować przez Google.");
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się kontynuować przez Google.");
    }
  };

  if (showVerification) {
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
            <span className="font-medium text-[var(--mt-ink)]">{email}</span>
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
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              required
              className={fieldClass}
            />
          </div>

          {error ? (
            <p className="text-sm text-[var(--mt-signal)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={fetchStatus === "fetching"}
            className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {fetchStatus === "fetching" ? "Sprawdzam…" : "Potwierdź konto"}
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
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm text-[var(--mt-muted)]"
          >
            Hasło
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            className={fieldClass}
          />
        </div>

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

        {error ? (
          <p className="text-sm text-[var(--mt-signal)]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={fetchStatus === "fetching" || !acceptedTerms}
          className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
        >
          {fetchStatus === "fetching" ? "Tworzę konto…" : "Załóż konto"}
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
        disabled={fetchStatus === "fetching" || !acceptedTerms}
        className="w-full border border-[var(--mt-line)] bg-white/50 px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-accent)] disabled:opacity-50"
      >
        Kontynuuj z Google
      </button>

      <p className="mt-7 text-sm text-[var(--mt-muted)]">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
        >
          Zaloguj się
        </Link>
      </p>

      <div id="clerk-captcha" />
    </AuthShell>
  );
};

export default RegisterForm;

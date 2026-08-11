"use client";

import Link from "next/link";
import {useSignIn} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState} from "react";
import AuthShell from "./AuthShell";

const fieldClass =
  "w-full border border-[var(--mt-line)] bg-white/70 px-4 py-3 outline-none transition focus:border-[var(--mt-accent)]";

const LoginForm = () => {
  const {signIn} = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");

    try {
      const {error: ssoError} = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectCallbackUrl: "/login",
      });

      if (ssoError) {
        console.error(ssoError);
        setError("Nie udało się zalogować przez Google.");
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się zalogować przez Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!signIn) return;

    try {
      setIsSubmitting(true);

      const {error: passwordError} = await signIn.password({
        identifier: email,
        password,
      });

      if (passwordError) {
        setError("Nieprawidłowy email lub hasło.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Nieprawidłowy email lub hasło.");
    } finally {
      setIsSubmitting(false);
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
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </div>

        {error ? (
          <p className="text-sm text-[var(--mt-signal)]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
        >
          {isSubmitting ? "Logowanie…" : "Zaloguj się"}
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
        className="w-full border border-[var(--mt-line)] bg-white/50 px-4 py-3.5 text-sm font-medium transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-accent)]"
      >
        Kontynuuj z Google
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

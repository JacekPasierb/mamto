"use client";

import {AuthenticateWithRedirectCallback} from "@clerk/nextjs";

export default function SsoCallbackPage() {
  return (
    <main className="mt-atmosphere flex min-h-screen items-center justify-center px-6 text-[var(--mt-ink)]">
      <div className="mt-stage w-full max-w-sm border border-[var(--mt-line)] bg-white/70 p-8 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
          Google
        </p>
        <p className="font-display mt-3 text-2xl tracking-tight">
          Kończę logowanie…
        </p>

        <AuthenticateWithRedirectCallback
          signInUrl="/login"
          signUpUrl="/register"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          continueSignUpUrl="/sso-continue"
        />

        <div id="clerk-captcha" className="mt-6" />
      </div>
    </main>
  );
}

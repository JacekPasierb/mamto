"use client";

import Link from "next/link";

import AppShell from "@/components/dashboard/AppShell";
import {NavIcon} from "@/components/icons/NavIcons";

type GuideStep = {
  title: string;
  body: string;
};

type GuideBlockProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  steps: GuideStep[];
  tip?: string;
};

const GuideBlock = ({id, eyebrow, title, lead, steps, tip}: GuideBlockProps) => (
  <section id={id} className="scroll-mt-24 border-t border-[var(--mt-line)] pt-10">
    <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
      {eyebrow}
    </p>
    <h2 className="font-display mt-3 text-2xl tracking-tight sm:text-3xl">
      {title}
    </h2>
    <p className="mt-3 max-w-2xl text-[var(--mt-muted)]">{lead}</p>

    <ol className="mt-8 space-y-0 divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)]">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4 py-5 sm:gap-5">
          <span
            className="font-display mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--mt-line)] text-sm text-[var(--mt-accent)]"
            aria-hidden
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg tracking-tight">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--mt-muted)]">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>

    {tip ? (
      <p className="mt-5 text-sm leading-relaxed text-[var(--mt-muted)]">
        <span className="font-medium text-[var(--mt-ink)]">Wskazówka: </span>
        {tip}
      </p>
    ) : null}
  </section>
);

const PoradnikPage = () => {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
          Pomoc
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--mt-accent)] text-[var(--mt-accent)]"
            aria-hidden
          >
            <NavIcon id="guide" active className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-4xl tracking-tight">Poradnik</h1>
            <p className="mt-3 text-[var(--mt-muted)]">
              Jak dodać MamTo do telefonu i włączyć powiadomienia push o
              pilnych sprawach.
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-[var(--mt-line)] py-4 text-sm">
          <a
            href="#instalacja"
            className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
          >
            Instalacja na telefonie
          </a>
          <a
            href="#powiadomienia"
            className="text-[var(--mt-accent)] underline-offset-4 hover:underline"
          >
            Powiadomienia push
          </a>
          <Link
            href="/settings"
            className="text-[var(--mt-muted)] underline-offset-4 hover:text-[var(--mt-accent)] hover:underline"
          >
            ← Ustawienia
          </Link>
        </nav>

        <GuideBlock
          id="instalacja"
          eyebrow="Poradnik 01"
          title="Dodaj MamTo do pulpitu telefonu"
          lead="Po instalacji MamTo otwiera się jak aplikacja — pełny ekran, ikona na telefonie. To potrzebne zwłaszcza na iPhonie przy powiadomieniach."
          steps={[
            {
              title: "iPhone (Safari / Chrome)",
              body: "Otwórz mam-to.netlify.app w Safari lub Chrome. Zaloguj się. Na dole ekranu kliknij ikonę Udostępnij (kwadrat ze strzałką w górę).",
            },
            {
              title: "Do ekranu początkowego",
              body: "W menu udostępniania przewiń i wybierz „Do ekranu początkowego”, potem „Dodaj”. Na pulpicie pojawi się ikona MamTo.",
            },
            {
              title: "Otwieraj z ikony",
              body: "Od teraz korzystaj z MamTo przez ikonę na ekranie początkowym — nie z karty w przeglądarce. Tak działa tryb aplikacji.",
            },
            {
              title: "Android (Chrome)",
              body: "Otwórz stronę w Chrome i zaloguj się. Chrome często pokazuje baner „Zainstaluj aplikację” — kliknij go. Alternatywnie: menu ⋮ → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”.",
            },
            {
              title: "Ikona na Androidzie",
              body: "Po instalacji MamTo pojawi się wśród aplikacji. Otwieraj je stamtąd — wygląda i działa jak zwykła apka.",
            },
          ]}
          tip="Na iPhonie instalacja działa najpewniej z Safari. Na Androidzie najlepiej Chrome."
        />

        <GuideBlock
          id="powiadomienia"
          eyebrow="Poradnik 02"
          title="Włącz powiadomienia push"
          lead="Dostaniesz przypomnienie o sprawach po terminie i pilnych terminach — nawet gdy MamTo jest zamknięte."
          steps={[
            {
              title: "Zainstaluj MamTo (iPhone obowiązkowo)",
              body: "Na iPhonie najpierw dodaj MamTo do ekranu początkowego (poradnik wyżej) i otwórz je z ikony. Na Androidzie wystarczy Chrome albo zainstalowana apka.",
            },
            {
              title: "Wejdź w Ustawienia",
              body: "W menu MamTo wybierz Ustawienia. Przewiń do sekcji „Powiadomienia” → „Push na telefon”.",
            },
            {
              title: "Włącz przełącznik",
              body: "Przesuń przełącznik w prawo. Gdy telefon zapyta o zgodę na powiadomienia — wybierz Zezwól / Allow.",
            },
            {
              title: "Sprawdź systemowe uprawnienia",
              body: "Jeśli nic nie przychodzi: w ustawieniach telefonu → Powiadomienia → MamTo (lub Chrome) upewnij się, że powiadomienia są włączone.",
            },
            {
              title: "Kiedy dostaniesz push?",
              body: "Gdy masz sprawy pilne lub po terminie. Przypomnienia wychodzą rano (ok. 7–8 czasu polskiego). Ten sam zestaw spraw nie wyśle się drugi raz tego samego dnia.",
            },
          ]}
          tip="Możesz też otworzyć Ustawienia i włączyć push od razu — link poniżej."
        />

        <div className="mt-10 flex flex-wrap gap-4 border-t border-[var(--mt-line)] pt-8">
          <Link
            href="/settings"
            className="bg-[var(--mt-ink)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            Przejdź do ustawień powiadomień
          </Link>
          <Link
            href="/dashboard"
            className="border border-[var(--mt-line)] px-5 py-3.5 text-sm font-medium transition hover:border-[var(--mt-ink)]"
          >
            Wróć na pulpit
          </Link>
        </div>
      </div>
    </AppShell>
  );
};

export default PoradnikPage;

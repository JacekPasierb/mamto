import Link from "next/link";

import MamToLogo from "@/components/brand/MamToLogo";
import {LEGAL, LEGAL_LINKS} from "@/lib/legal";

type LegalPageShellProps = {
  title: string;
  children: React.ReactNode;
};

export const LegalPageShell = ({title, children}: LegalPageShellProps) => {
  return (
    <main className="mt-atmosphere relative min-h-screen text-[var(--mt-ink)]">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10 sm:px-10 lg:py-14">
        <header className="flex flex-col gap-6 border-b border-[var(--mt-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" aria-label="MamTo — strona główna">
              <MamToLogo className="[&_svg]:h-8 [&_svg]:w-8 [&_span]:text-xl" />
            </Link>
            <p className="mt-8 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
              Dokumenty prawne
            </p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">{title}</h1>
            <p className="mt-3 text-sm text-[var(--mt-muted)]">
              Obowiązuje od: {LEGAL.effectiveDate}
            </p>
          </div>
        </header>

        <article className="legal-prose mt-10 space-y-8 pb-16 text-[0.98rem] leading-relaxed text-[var(--mt-ink)]">
          {children}
        </article>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--mt-line)] py-6 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--mt-muted)] transition hover:text-[var(--mt-accent)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-[var(--mt-muted)] transition hover:text-[var(--mt-accent)]"
          >
            Strona główna
          </Link>
        </nav>

        <p className="pb-10 text-xs leading-relaxed text-[var(--mt-muted)]">
          Dokument ma charakter wzorcowy. Przed uruchomieniem komercyjnym
          uzupełnij dane operatora w konfiguracji i skonsultuj treść z prawnikiem.
        </p>
      </div>
    </main>
  );
};

type LegalSectionProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

export const LegalSection = ({id, title, children}: LegalSectionProps) => (
  <section id={id} className="scroll-mt-8">
    <h2 className="font-display text-2xl tracking-tight">{title}</h2>
    <div className="mt-4 space-y-3 text-[var(--mt-muted)] [&_a]:text-[var(--mt-accent)] [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-[var(--mt-ink)] [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  </section>
);

export const SiteFooter = () => (
  <footer className="border-t border-[var(--mt-line)] bg-[#eef3f5]">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
      <MamToLogo className="[&_svg]:h-7 [&_svg]:w-7 [&_span]:text-lg" />
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--mt-muted)]">
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition hover:text-[var(--mt-accent)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-[var(--mt-muted)]">
        © {new Date().getFullYear()} {LEGAL.appName}
      </p>
    </div>
  </footer>
);

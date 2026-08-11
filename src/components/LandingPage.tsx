import Image from "next/image";
import Link from "next/link";
import MamToLogo from "@/components/brand/MamToLogo";

const domains = [
  {
    index: "01",
    title: "Pojazdy",
    line: "Przeglądy, olej, opony — zanim wypadną z kalendarza.",
  },
  {
    index: "02",
    title: "Ubezpieczenia",
    line: "Auto i dom. Terminy polis zawsze pod ręką.",
  },
  {
    index: "03",
    title: "Zapasy",
    line: "Leki i rzeczy, których nie może zabraknąć w środku kuracji.",
  },
  {
    index: "04",
    title: "Wizyty",
    line: "Fryzjer, kosmetyczka i inne spotkania, o których łatwo zapomnieć.",
  },
];

const LandingPage = () => {
  return (
    <main className="min-h-screen text-[var(--mt-ink)]">
      {/* Hero: one composition — brand, headline, line, CTAs, full-bleed image */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <Image
          src="/mamto-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Legibility plane — not a floating badge overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eef3f5]/95 via-[#eef3f5]/78 to-[#eef3f5]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#e8eef1]/90 via-transparent to-[#eef3f5]/40" />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <header className="mt-rise flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
            <MamToLogo />
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
            >
              Zaloguj się
            </Link>
          </header>

          <div className="flex flex-1 flex-col justify-center px-6 pb-16 sm:px-10 lg:px-14">
            <div className="max-w-2xl">
              <h1 className="mt-rise mt-rise-delay-1 font-display text-[clamp(3.2rem,12vw,7.5rem)] leading-[0.9] tracking-tight text-[var(--mt-ink)]">
                MamTo
              </h1>

              <p className="mt-rise mt-rise-delay-2 mt-6 max-w-md text-[1.15rem] leading-relaxed text-[var(--mt-muted)] sm:text-xl">
                Organizer człowieka. Pojazdy, polisy, leki i wizyty — jedno
                miejsce, zero zgadywania.
              </p>

              <div className="mt-rise mt-rise-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="bg-[var(--mt-ink)] px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
                >
                  Załóż konto
                </Link>
                <Link
                  href="/login"
                  className="border border-[var(--mt-ink)]/20 px-7 py-3.5 text-center text-sm font-semibold text-[var(--mt-ink)] transition hover:border-[var(--mt-accent)] hover:text-[var(--mt-accent)]"
                >
                  Mam już konto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One job: life domains */}
      <section className="mt-atmosphere relative border-t border-[var(--mt-line)]">
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
          <p className="mt-rise text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-accent)]">
            Po co jest MamTo
          </p>
          <h2 className="mt-rise mt-rise-delay-1 font-display mt-3 max-w-xl text-3xl tracking-tight sm:text-4xl">
            Życie ma wiele wątków. Trzymamy je razem.
          </h2>

          <div className="mt-rise mt-rise-delay-2 mt-14 grid gap-0 border-y border-[var(--mt-line)] sm:grid-cols-2 lg:grid-cols-4">
            {domains.map((domain, index) => (
              <article
                key={domain.index}
                className={`group px-0 py-8 sm:px-5 sm:first:pl-0 ${
                  index < domains.length - 1
                    ? "border-b border-[var(--mt-line)] sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <p className="font-display text-xs text-[var(--mt-accent)]">
                  {domain.index}
                </p>
                <h3 className="font-display mt-4 text-2xl tracking-tight">
                  {domain.title}
                </h3>
                <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[var(--mt-muted)]">
                  {domain.line}
                </p>
                <span className="mt-6 block h-[2px] w-0 bg-[var(--mt-accent)] transition-all duration-500 group-hover:w-12" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* One job: close CTA */}
      <section className="border-t border-[var(--mt-line)] bg-[var(--mt-ink)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-14 lg:py-20">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-white/50">
              Gotowy?
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Zacznij pilnować tego, co ważne.
            </h2>
          </div>
          <Link
            href="/register"
            className="shrink-0 bg-white px-7 py-3.5 text-center text-sm font-semibold text-[var(--mt-ink)] transition hover:bg-[var(--mt-accent-soft)]"
          >
            Załóż konto
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--mt-line)] bg-[#eef3f5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <MamToLogo className="[&_svg]:h-7 [&_svg]:w-7 [&_span]:text-lg" />
          <p className="text-xs text-[var(--mt-muted)]">
            Organizer życia · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;

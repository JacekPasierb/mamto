import Link from "next/link";
import MamToLogo from "@/components/brand/MamToLogo";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const AuthShell = ({eyebrow, title, description, children}: AuthShellProps) => {
  return (
    <main className="mt-atmosphere relative min-h-screen text-[var(--mt-ink)]">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <aside className="flex flex-col justify-between border-b border-[var(--mt-line)] px-6 py-8 sm:px-10 lg:w-[42%] lg:border-r lg:border-b-0 lg:px-12 lg:py-12">
          <div>
            <Link href="/" aria-label="MamTo — strona główna">
              <MamToLogo />
            </Link>

            <p className="mt-rise mt-16 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-accent)]">
              {eyebrow}
            </p>
            <h1 className="mt-rise mt-rise-delay-1 font-display mt-4 max-w-sm text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-rise mt-rise-delay-2 mt-5 max-w-sm text-[1.05rem] leading-relaxed text-[var(--mt-muted)]">
              {description}
            </p>
          </div>

          <p className="mt-12 hidden text-sm text-[var(--mt-muted)] lg:block">
            Pojazdy · polisy · leki · wizyty
          </p>
        </aside>

        <section className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div className="mt-rise mt-rise-delay-2 mt-stage w-full max-w-md border border-[var(--mt-line)] p-7 sm:p-9">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthShell;

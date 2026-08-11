import Link from "next/link";

export type ReminderListItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  reason: string;
};

type ReminderSectionProps = {
  title: string;
  description: string;
  emptyText: string;
  tone?: "signal" | "default" | "ok";
  items?: ReminderListItem[];
  isLoading?: boolean;
};

const toneAccent = {
  signal: "var(--mt-signal)",
  default: "var(--mt-accent)",
  ok: "var(--mt-ok)",
} as const;

const ReminderSection = ({
  title,
  description,
  emptyText,
  tone = "default",
  items = [],
  isLoading = false,
}: ReminderSectionProps) => {
  return (
    <section>
      <div className="flex items-start gap-4">
        <span
          className="mt-2 h-9 w-[2px] shrink-0"
          style={{background: toneAccent[tone]}}
          aria-hidden
        />
        <div>
          <h2 className="font-display text-xl tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-[var(--mt-muted)]">{description}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-5 border border-dashed border-[var(--mt-line)] bg-white/35 px-6 py-10 text-center">
          <p className="text-sm text-[var(--mt-muted)]">Ładowanie…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 border border-dashed border-[var(--mt-line)] bg-white/35 px-6 py-10 text-center">
          <p className="text-sm text-[var(--mt-muted)]">{emptyText}</p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)] bg-white/45">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group block px-4 py-4 transition hover:bg-white/90"
              >
                <p className="font-display text-[1.05rem] tracking-tight transition group-hover:text-[var(--mt-accent)]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-[var(--mt-muted)]">
                  {item.subtitle}
                </p>
                <p
                  className="mt-2 text-sm font-medium"
                  style={{color: toneAccent[tone]}}
                >
                  {item.reason}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReminderSection;

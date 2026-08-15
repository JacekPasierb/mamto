import Link from "next/link";

import {
  AttentionIcon,
  type AttentionIconId,
} from "@/components/icons/AttentionIcons";

export type ReminderListItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  reason: string;
  overdue?: boolean;
  refill?: {
    usageMode: "daily" | "static";
    unit: string;
    currentStock: number;
  };
};

type ReminderSectionProps = {
  title: string;
  description: string;
  emptyText: string;
  tone?: "signal" | "default" | "ok";
  icon?: AttentionIconId;
  items?: ReminderListItem[];
  isLoading?: boolean;
  onRefill?: (item: ReminderListItem) => void;
};

const toneAccent = {
  signal: "var(--mt-signal)",
  default: "var(--mt-accent)",
  ok: "var(--mt-ok)",
} as const;

const AttentionMark = ({label}: {label: string}) => (
  <span
    className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]"
    style={{color: "var(--mt-signal)"}}
    title={label}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.2 19.8 18.5H4.2L12 4.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="miter"
      />
      <path
        d="M12 10.2v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="square"
      />
      <rect x="11.15" y="16.2" width="1.7" height="1.7" fill="currentColor" />
    </svg>
    {label}
  </span>
);

const ReminderSection = ({
  title,
  description,
  emptyText,
  tone = "default",
  icon,
  items = [],
  isLoading = false,
  onRefill,
}: ReminderSectionProps) => {
  const overdueInSection = items.filter((item) => item.overdue).length;
  const accent = toneAccent[tone];

  return (
    <section className="group/attn">
      <div className="flex items-start gap-3.5">
        {icon ? (
          <span className="mt-attention-mark" style={{color: accent}}>
            <AttentionIcon id={icon} />
          </span>
        ) : (
          <span
            className="mt-2 h-9 w-[2px] shrink-0"
            style={{background: accent}}
            aria-hidden
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl tracking-tight">{title}</h2>
            {overdueInSection > 0 ? (
              <AttentionMark label="Po terminie" />
            ) : null}
          </div>
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
              <div className="flex items-start justify-between gap-4 px-4 py-4 transition hover:bg-white/90">
                <Link href={item.href} className="group min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-[1.05rem] tracking-tight transition group-hover:text-[var(--mt-accent)]">
                      {item.title}
                    </p>
                    {item.overdue ? <AttentionMark label="Uwaga" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--mt-muted)]">
                    {item.subtitle}
                  </p>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{
                      color: item.overdue ? "var(--mt-signal)" : accent,
                    }}
                  >
                    {item.reason}
                  </p>
                </Link>

                {item.refill && onRefill ? (
                  <button
                    type="button"
                    onClick={() => onRefill(item)}
                    className="shrink-0 text-sm font-medium text-[var(--mt-ink)] underline-offset-4 transition hover:text-[var(--mt-accent)] hover:underline"
                  >
                    Uzupełnij zapas
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReminderSection;

import type {SVGProps} from "react";

type GlyphProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

/** Pilne — radar z blokadą „teraz”. */
export const IconUrgent = ({className = "", ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={`mt-attention-icon ${className}`.trim()}
    aria-hidden
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="15.5"
      stroke="currentColor"
      strokeWidth="1.4"
      opacity="0.28"
    />
    <circle
      cx="20"
      cy="20"
      r="10.2"
      stroke="currentColor"
      strokeWidth="1.4"
      opacity="0.45"
    />
    <path
      className="mt-attention-sweep"
      d="M20 4.5A15.5 15.5 0 0 1 35.5 20"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
    />
    <path
      d="M20 12.2v5.4M17.3 20h5.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <rect
      className="mt-icon-accent"
      x="17.4"
      y="17.4"
      width="5.2"
      height="5.2"
      transform="rotate(45 20 20)"
      fill="currentColor"
    />
  </svg>
);

/** Nadchodzące — tor czasu z nadchodzącym znacznikiem. */
export const IconUpcoming = ({className = "", ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={`mt-attention-icon ${className}`.trim()}
    aria-hidden
    {...props}
  >
    <path
      d="M6 28.5c4.2-9.5 10.2-14.5 14-14.5s9.8 5 14 14.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M10.2 22.5h2.4M18.8 15.2h2.4M27.4 22.5h2.4"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.45"
    />
    <path
      d="M6 28.5h28"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      opacity="0.35"
    />
    <circle
      className="mt-attention-bead mt-icon-accent"
      cx="27.5"
      cy="18.2"
      r="2.4"
      fill="currentColor"
    />
    <path
      d="M27.5 11.5v2.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
    />
  </svg>
);

/** Stany — zbiornik z poziomem i podziałką przyszłości. */
export const IconLevels = ({className = "", ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={`mt-attention-icon ${className}`.trim()}
    aria-hidden
    {...props}
  >
    <path
      d="M13 8.5h14M15 8.5v3.2L12.2 15v15.3c0 1.2.9 2.2 2.1 2.2h11.4c1.2 0 2.1-1 2.1-2.2V15L25 11.7V8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M28.8 17.5h3M28.8 22h2.2M28.8 26.5h3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      opacity="0.45"
    />
    <path
      className="mt-attention-fill mt-icon-accent"
      d="M13.8 24.2h12.4V30H13.8z"
      fill="currentColor"
    />
    <path
      d="M13.5 24.2h13"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      opacity="0.55"
    />
  </svg>
);

/** Nagłówek sekcji — pole wektorów zbieżnych w punkt działania. */
export const IconActionField = ({className = "", ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={`mt-attention-icon ${className}`.trim()}
    aria-hidden
    {...props}
  >
    <path
      d="M7 11.5 20 20l13-8.5"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="square"
      strokeLinejoin="miter"
      opacity="0.4"
    />
    <path
      d="M7 28.5 20 20l13 8.5"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="square"
      strokeLinejoin="miter"
      opacity="0.4"
    />
    <path
      d="M8.5 20H16M24 20h7.5"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="square"
      opacity="0.55"
    />
    <circle
      cx="20"
      cy="20"
      r="5.2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle
      className="mt-icon-accent mt-attention-core"
      cx="20"
      cy="20"
      r="2.1"
      fill="currentColor"
    />
  </svg>
);

export type AttentionIconId = "urgent" | "upcoming" | "levels" | "action";

const map = {
  urgent: IconUrgent,
  upcoming: IconUpcoming,
  levels: IconLevels,
  action: IconActionField,
} as const;

export const AttentionIcon = ({
  id,
  className,
  ...props
}: GlyphProps & {id: AttentionIconId}) => {
  const Cmp = map[id];
  return <Cmp className={className} {...props} />;
};

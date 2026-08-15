import type {SVGProps} from "react";

type GlyphProps = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

const base = (active?: boolean, className?: string) =>
  `mt-nav-icon ${active ? "is-active" : ""} ${className ?? ""}`.trim();

/** Pulpit — horyzont życia ze znacznikiem „teraz”. */
export const IconDashboard = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <path
      d="M3.5 18.5V5.5h7.2L14 12.2 17.3 5.5H20.5v13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path
      d="M3.5 18.5h17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <circle
      className="mt-icon-accent"
      cx="14"
      cy="12.2"
      r="1.35"
      fill="currentColor"
    />
    <path
      d="M7 14.5h4.5M7 11h2.8"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.55"
    />
  </svg>
);

/** Pojazdy — droga w perspektywę + miniatura tablicy. */
export const IconVehicles = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <path
      d="M4 19.5 10.2 5.5h3.6L20 19.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path
      d="M12 7.2v2.2M12 11.2v1.6M12 14.6v1.4"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.5"
    />
    <rect
      className="mt-icon-accent-stroke"
      x="8.2"
      y="16.4"
      width="7.6"
      height="3.2"
      rx="0.4"
      stroke="currentColor"
      strokeWidth="1.35"
      fill="none"
    />
    <path
      className="mt-icon-accent"
      d="M8.2 16.4h1.6v3.2H8.2z"
      fill="currentColor"
    />
  </svg>
);

/** Ubezpieczenia — pieczęć polisy z zakładką terminu. */
export const IconInsurance = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <path
      d="M12 3.5 19.2 7.2v5.4c0 4.1-2.9 6.9-7.2 8.4-4.3-1.5-7.2-4.3-7.2-8.4V7.2L12 3.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M8.2 11.2h7.6M8.2 14h5.2"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.55"
    />
    <path
      d="m10.1 10.8 1.7 1.7 3.3-3.5"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
    />
  </svg>
);

/** Wizyty — slot w kalendarzu przecięty łukiem nożyczek. */
export const IconVisits = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <rect
      x="4"
      y="5.5"
      width="16"
      height="14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4 9.5h16M9 3.8v3.2M15 3.8v3.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M8.2 14.2c1.4-2.2 3.2-3.3 5.3-3.3"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.55"
    />
    <circle
      className="mt-icon-accent"
      cx="8.2"
      cy="14.2"
      r="1.5"
      fill="currentColor"
    />
    <circle
      cx="15.8"
      cy="14.2"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.35"
      fill="none"
    />
    <path
      d="M9.5 13.4 14.5 16.6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
    />
  </svg>
);

/** Zapasy — fiolka z poziomem i podziałką. */
export const IconStock = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <path
      d="M9 4.5h6M10 4.5v2.2l-2.2 2.4v9.4c0 .8.6 1.5 1.5 1.5h5.4c.9 0 1.5-.7 1.5-1.5V9.1L14 6.7V4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M8.2 14.2h7.6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.45"
    />
    <path
      className="mt-icon-accent"
      d="M9.2 14.2h5.6v5.3H9.2z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M16.8 11.2h1.6M16.8 13.5h1.2M16.8 15.8h1.6"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      opacity="0.5"
    />
  </svg>
);

/** Ustawienia — suwaki preferencji, nie zębatka. */
export const IconSettings = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <path
      d="M4.5 7.5h9.5M4.5 12h15M4.5 16.5h11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <circle
      cx="17.2"
      cy="7.5"
      r="2.15"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
    />
    <circle
      className="mt-icon-accent"
      cx="9.2"
      cy="12"
      r="2.15"
      fill="currentColor"
    />
    <circle
      cx="18.3"
      cy="16.5"
      r="2.15"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
    />
  </svg>
);

/** Dokumenty — dowód / paszport z paskiem ważności. */
export const IconDocuments = ({active, className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={base(active, className)}
    aria-hidden
    {...props}
  >
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4 9.2h16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M7.2 12.4h5.6M7.2 15h3.8"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.55"
    />
    <rect
      className="mt-icon-accent"
      x="14.2"
      y="12"
      width="3.6"
      height="4.2"
      fill="currentColor"
    />
  </svg>
);

export type NavIconId =
  | "dashboard"
  | "vehicles"
  | "insurance"
  | "documents"
  | "visits"
  | "stock"
  | "settings";

const map = {
  dashboard: IconDashboard,
  vehicles: IconVehicles,
  insurance: IconInsurance,
  documents: IconDocuments,
  visits: IconVisits,
  stock: IconStock,
  settings: IconSettings,
} as const;

type NavIconProps = GlyphProps & {
  id: NavIconId;
};

export const NavIcon = ({id, ...props}: NavIconProps) => {
  const Cmp = map[id];
  return <Cmp {...props} />;
};

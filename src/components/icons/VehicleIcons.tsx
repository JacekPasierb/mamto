import type {SVGProps} from "react";

type GlyphProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

const shell = (className?: string) =>
  `mt-vehicle-icon ${className ?? ""}`.trim();

/** Nagłówek floty — pasy drogi zbiegające się w punkt kontroli. */
export const IconFleet = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <path
      d="M6 30.5 16.5 9.5h7L34 30.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path
      d="M20 12.2v2.4M20 17.4v1.8M20 21.8v1.6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.45"
    />
    <path
      d="M6 30.5h28"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      opacity="0.35"
    />
    <rect
      className="mt-icon-accent"
      x="16.6"
      y="25.2"
      width="6.8"
      height="3"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="currentColor"
    />
  </svg>
);

/** Samochód — profil kabiny z osią przyszłości. */
export const IconCar = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <path
      d="M7.5 24.2h25M10.2 24.2l2.6-7.4h10.4l4.2 7.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M14.2 16.8h8.6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.45"
    />
    <circle cx="13.2" cy="27.2" r="2.35" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="26.8" cy="27.2" r="2.35" stroke="currentColor" strokeWidth="1.4" />
    <circle
      className="mt-icon-accent"
      cx="26.8"
      cy="27.2"
      r="1"
      fill="currentColor"
    />
  </svg>
);

/** Motocykl — sylwetka z przednim kołem jako znacznikiem. */
export const IconMotorcycle = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <circle cx="11.5" cy="26.5" r="4.2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="28.5" cy="26.5" r="4.2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M15.6 25.2 22 14.8h4.2L28.5 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M22 14.8 18.4 22.8h6.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="miter"
    />
    <circle
      className="mt-icon-accent"
      cx="11.5"
      cy="26.5"
      r="1.35"
      fill="currentColor"
    />
  </svg>
);

/** Inny pojazd — abstrakcyjna kapsuła ruchu. */
export const IconVehicleOther = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <rect
      x="8"
      y="14"
      width="24"
      height="12"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 20h24"
      stroke="currentColor"
      strokeWidth="1.35"
      opacity="0.4"
    />
    <circle cx="14" cy="26" r="2.2" stroke="currentColor" strokeWidth="1.35" />
    <circle cx="26" cy="26" r="2.2" stroke="currentColor" strokeWidth="1.35" />
    <path
      className="mt-icon-accent"
      d="M18.5 17.2h3v5.6h-3z"
      fill="currentColor"
    />
  </svg>
);

/** Przebieg — licznik z łukiem dystansu. */
export const IconMileage = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <path
      d="M8.5 27.5a13 13 0 0 1 23 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path
      d="M12.2 27.5a9 9 0 0 1 15.6 0"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.4"
    />
    <path
      d="M20 27.5V16.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <circle
      className="mt-icon-accent"
      cx="20"
      cy="27.5"
      r="2"
      fill="currentColor"
    />
  </svg>
);

/** Serwis — wszystko / hub czynności. */
export const IconServiceAll = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <rect x="8" y="8" width="10" height="10" stroke="currentColor" strokeWidth="1.45" />
    <rect x="22" y="8" width="10" height="10" stroke="currentColor" strokeWidth="1.45" />
    <rect x="8" y="22" width="10" height="10" stroke="currentColor" strokeWidth="1.45" />
    <rect
      className="mt-icon-accent"
      x="22"
      y="22"
      width="10"
      height="10"
      fill="currentColor"
    />
  </svg>
);

/** Eksploatacja — kropla oleju + takt okresowy. */
export const IconMaintenance = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <path
      d="M20 7.5c4.8 6.2 8 10.2 8 14.2a8 8 0 1 1-16 0c0-4 3.2-8 8-14.2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M16.2 22.5h7.6"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      opacity="0.45"
    />
    <circle
      className="mt-icon-accent"
      cx="20"
      cy="25.5"
      r="1.6"
      fill="currentColor"
    />
  </svg>
);

/** Naprawy — klucz wektorowy przecinający oś. */
export const IconRepairs = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <path
      d="M14.5 12.2a5.2 5.2 0 0 1 7.4 7.4L12.2 29.3l-2.8-2.8 9.7-9.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
    />
    <path
      d="M24.8 10.5 29.5 15.2"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="square"
    />
    <path
      className="mt-icon-accent"
      d="M26.5 25.2h6.2v6.2h-6.2z"
      fill="currentColor"
      transform="rotate(45 29.6 28.3)"
    />
  </svg>
);

/** Przeglądy — pieczęć dopuszczenia z haczykiem. */
export const IconInspections = ({className, ...props}: GlyphProps) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={shell(className)}
    aria-hidden
    {...props}
  >
    <circle cx="20" cy="20" r="12.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="8.2" stroke="currentColor" strokeWidth="1.35" opacity="0.4" />
    <path
      d="m14.8 20.2 3.4 3.4 7.2-7.6"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <circle
      className="mt-icon-accent"
      cx="20"
      cy="20"
      r="1.5"
      fill="currentColor"
    />
  </svg>
);

export type VehicleKindIconId = "car" | "motorcycle" | "other";
export type VehicleServiceIconId =
  | "all"
  | "maintenance"
  | "repairs"
  | "inspections";

export const VehicleKindIcon = ({
  id,
  className,
  ...props
}: GlyphProps & {id: VehicleKindIconId}) => {
  if (id === "motorcycle") return <IconMotorcycle className={className} {...props} />;
  if (id === "other") return <IconVehicleOther className={className} {...props} />;
  return <IconCar className={className} {...props} />;
};

export const VehicleServiceIcon = ({
  id,
  className,
  ...props
}: GlyphProps & {id: VehicleServiceIconId}) => {
  if (id === "maintenance") return <IconMaintenance className={className} {...props} />;
  if (id === "repairs") return <IconRepairs className={className} {...props} />;
  if (id === "inspections") return <IconInspections className={className} {...props} />;
  return <IconServiceAll className={className} {...props} />;
};

"use client";

import {Oswald} from "next/font/google";

const plateFont = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

type PolishPlateProps = {
  number?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Dwuliniowa tablica (motocykl) */
  stacked?: boolean;
};

/** Normalizuje nr do układu zbliżonego do polskiej blachy. */
export function formatPolishPlate(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "";

  const match = cleaned.match(/^([A-Z]{2,3})([A-Z0-9]{3,6})$/);
  if (match) return `${match[1]} ${match[2]}`;

  return cleaned.replace(/(.{2,3})(.+)/, "$1 $2");
}

function EuStars({className}: {className?: string}) {
  const stars = Array.from({length: 12}, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const cx = 50 + Math.cos(angle) * 34;
    const cy = 50 + Math.sin(angle) * 34;
    return (
      <polygon
        key={i}
        points="50,8 54.5,20 67,20 57,28 60.5,40 50,32.5 39.5,40 43,28 33,20 45.5,20"
        fill="#FFCC00"
        transform={`translate(${cx - 50} ${cy - 50}) scale(0.22)`}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      {stars}
    </svg>
  );
}

const SIZE = {
  sm: {
    height: "h-[2.65rem]",
    radius: "rounded-[5px]",
    band: "w-7",
    pl: "text-[0.55rem]",
    stars: "h-4 w-4",
    text: "text-[1.35rem] tracking-[0.12em]",
    pad: "px-2.5",
    border: "border-[2.5px]",
  },
  md: {
    height: "h-[3.35rem]",
    radius: "rounded-[6px]",
    band: "w-9",
    pl: "text-[0.65rem]",
    stars: "h-5 w-5",
    text: "text-[1.75rem] tracking-[0.14em]",
    pad: "px-3.5",
    border: "border-[3px]",
  },
  lg: {
    height: "h-[4.25rem]",
    radius: "rounded-[7px]",
    band: "w-11",
    pl: "text-[0.75rem]",
    stars: "h-6 w-6",
    text: "text-[2.25rem] tracking-[0.16em]",
    pad: "px-4",
    border: "border-[3.5px]",
  },
} as const;

const PolishPlate = ({
  number,
  size = "md",
  className = "",
  stacked = false,
}: PolishPlateProps) => {
  const s = SIZE[size];
  const formatted = number ? formatPolishPlate(number) : "";
  const empty = !formatted;

  const [district, ...restParts] = formatted.split(" ");
  const serial = restParts.join(" ") || "";

  if (stacked && !empty) {
    return (
      <div
        className={`plate-shell relative inline-flex ${s.radius} ${className}`}
        title={formatted}
        aria-label={`Tablica rejestracyjna ${formatted}`}
      >
        <div
          className={`plate-face relative flex min-h-[4.5rem] min-w-[5.75rem] overflow-hidden ${s.radius} ${s.border} border-[#1a1a1a] bg-[#f7f7f2] shadow-[0_8px_24px_rgba(16,20,26,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]`}
        >
          <div
            className={`relative flex ${s.band} shrink-0 flex-col items-center justify-between bg-[#003399] py-2`}
          >
            <EuStars className={s.stars} />
            <span
              className={`${s.pl} font-bold leading-none tracking-wide text-white`}
            >
              PL
            </span>
          </div>
          <div
            className={`${plateFont.className} flex flex-1 flex-col items-center justify-center gap-0.5 px-2.5 py-2 leading-none text-[#111]`}
          >
            <span className="text-[1.15rem] font-bold tracking-[0.14em] sm:text-[1.35rem]">
              {district}
            </span>
            <span className="text-[1.25rem] font-bold tracking-[0.12em] sm:text-[1.45rem]">
              {serial}
            </span>
          </div>
          <div className="plate-shine pointer-events-none absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`plate-shell relative inline-flex max-w-full ${s.radius} ${className}`}
      title={empty ? "Brak numeru rejestracyjnego" : formatted}
      aria-label={
        empty
          ? "Brak numeru rejestracyjnego"
          : `Tablica rejestracyjna ${formatted}`
      }
    >
      <div
        className={`plate-face relative flex ${s.height} w-full min-w-[11rem] max-w-[20rem] overflow-hidden ${s.radius} ${s.border} border-[#1a1a1a] shadow-[0_10px_28px_rgba(16,20,26,0.2),0_2px_0_rgba(255,255,255,0.35)_inset,0_-2px_4px_rgba(0,0,0,0.12)_inset] ${
          empty ? "bg-[#ecece8] opacity-70" : "bg-[#f7f7f2]"
        }`}
      >
        {/* metal edge highlight */}
        <div
          className="pointer-events-none absolute inset-[2px] rounded-[4px] ring-1 ring-black/10"
          aria-hidden
        />

        <div
          className={`relative flex ${s.band} shrink-0 flex-col items-center justify-between bg-[#003399] py-1.5`}
        >
          <EuStars className={s.stars} />
          <span
            className={`${s.pl} font-bold leading-none tracking-wide text-white`}
          >
            PL
          </span>
          {/* rivet */}
          <span
            className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#c9a227]/40"
            aria-hidden
          />
        </div>

        <div
          className={`${plateFont.className} ${s.pad} ${s.text} relative flex flex-1 items-center justify-center font-bold uppercase leading-none text-[#111]`}
        >
          {empty ? (
            <span className="tracking-[0.3em] text-[#bbb]">······</span>
          ) : (
            <span className="whitespace-nowrap">
              <span className="mr-[0.35em]">{district}</span>
              <span>{serial}</span>
            </span>
          )}
        </div>

        <div className="plate-shine pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
};

export default PolishPlate;

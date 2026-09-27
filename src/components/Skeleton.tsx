import type {CSSProperties} from "react";

type BoneProps = {
  className?: string;
  style?: CSSProperties;
};

export const SkeletonBone = ({className = "", style}: BoneProps) => (
  <span
    className={`block animate-pulse rounded-sm bg-[var(--mt-line)] ${className}`}
    style={style}
    aria-hidden
  />
);

type ListSkeletonProps = {
  rows?: number;
  className?: string;
  compact?: boolean;
};

/** Wiersze jak na listach / w ReminderSection. */
export const ListSkeleton = ({
  rows = 4,
  className = "",
  compact = false,
}: ListSkeletonProps) => (
  <ul
    className={`divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)] bg-white/45 ${className}`}
    aria-busy="true"
    aria-label="Ładowanie"
  >
    {Array.from({length: rows}).map((_, index) => (
      <li
        key={index}
        className={compact ? "space-y-2 px-4 py-3.5" : "space-y-2.5 px-4 py-5"}
      >
        <SkeletonBone
          className={compact ? "h-3.5" : "h-4"}
          style={{width: `${48 + (index % 3) * 14}%`}}
        />
        <SkeletonBone
          className="h-3 opacity-70"
          style={{width: `${62 + (index % 4) * 8}%`}}
        />
        {!compact ? (
          <SkeletonBone
            className="h-3 opacity-60"
            style={{width: `${28 + (index % 3) * 10}%`}}
          />
        ) : null}
      </li>
    ))}
  </ul>
);

type CardGridSkeletonProps = {
  cards?: number;
  className?: string;
};

/** Siatka kart (pojazdy, zwierzęta). */
export const CardGridSkeleton = ({
  cards = 3,
  className = "",
}: CardGridSkeletonProps) => (
  <div
    className={`grid gap-0 border-t border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-3 ${className}`}
    aria-busy="true"
    aria-label="Ładowanie"
  >
    {Array.from({length: cards}).map((_, index) => (
      <div
        key={index}
        className="space-y-3 border-b border-[var(--mt-line)] py-7 md:border-r md:px-6 md:first:pl-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
      >
        <SkeletonBone className="h-2.5 w-20" />
        <SkeletonBone
          className="h-7"
          style={{width: `${55 + (index % 3) * 12}%`}}
        />
        <SkeletonBone className="h-3 w-3/4 opacity-70" style={{width: "70%"}} />
        <SkeletonBone className="mt-2 h-3 w-16 opacity-60" />
      </div>
    ))}
  </div>
);

type DomainGridSkeletonProps = {
  tiles?: number;
};

/** Kafelki obszarów na pulpicie. */
export const DomainGridSkeleton = ({tiles = 6}: DomainGridSkeletonProps) => (
  <div
    className="mt-8 grid gap-0 border-y border-[var(--mt-line)] md:grid-cols-2 xl:grid-cols-3"
    aria-busy="true"
    aria-label="Ładowanie obszarów"
  >
    {Array.from({length: tiles}).map((_, index) => (
      <div
        key={index}
        className={`space-y-3 px-0 py-7 md:px-5 md:first:pl-0 ${
          index < tiles - 1
            ? "border-b border-[var(--mt-line)] md:border-b-0 md:border-r"
            : "border-b border-[var(--mt-line)] md:border-b-0"
        }`}
      >
        <SkeletonBone className="size-7" />
        <SkeletonBone className="h-6 w-28" />
        <SkeletonBone className="h-3 w-40 opacity-70" />
        <SkeletonBone className="h-3 w-44 opacity-70" />
        <SkeletonBone className="mt-1 h-2.5 w-14 opacity-50" />
      </div>
    ))}
  </div>
);

/** Status dnia w nagłówku pulpitu. */
export const StatusSkeleton = () => (
  <div className="flex items-center justify-start gap-5 lg:justify-end" aria-busy="true">
    <div className="space-y-2 text-left lg:text-right">
      <SkeletonBone className="ml-0 h-2.5 w-20 lg:ml-auto" />
      <SkeletonBone className="ml-0 h-5 w-40 lg:ml-auto" />
      <SkeletonBone className="ml-0 h-2.5 w-28 opacity-70 lg:ml-auto" />
    </div>
    <SkeletonBone className="size-2.5 shrink-0" />
  </div>
);

/** Opcje w Quick Add / ustawieniach. */
export const OptionsSkeleton = ({rows = 4}: {rows?: number}) => (
  <div
    className="mt-6 divide-y divide-[var(--mt-line)] border-y border-[var(--mt-line)]"
    aria-busy="true"
    aria-label="Ładowanie"
  >
    {Array.from({length: rows}).map((_, index) => (
      <div key={index} className="flex items-center gap-4 py-4">
        <SkeletonBone className="size-10 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBone
            className="h-3.5"
            style={{width: `${40 + (index % 3) * 12}%`}}
          />
          <SkeletonBone
            className="h-2.5 opacity-70"
            style={{width: `${55 + (index % 4) * 8}%`}}
          />
        </div>
      </div>
    ))}
  </div>
);

/** Mały skeleton w dropdownie comboboxa. */
export const DropdownSkeleton = () => (
  <div className="space-y-0 px-4 py-2" aria-busy="true">
    {Array.from({length: 3}).map((_, index) => (
      <div key={index} className="py-2.5">
        <SkeletonBone
          className="h-3.5"
          style={{width: `${50 + index * 15}%`}}
        />
      </div>
    ))}
  </div>
);

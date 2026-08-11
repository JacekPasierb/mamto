type MamToLogoProps = {
  className?: string;
  showWordmark?: boolean;
};

const MamToLogo = ({className = "", showWordmark = true}: MamToLogoProps) => {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-9 shrink-0"
        aria-hidden
      >
        {/* Twin pillars = M; angled confirmation mark = "mam to" */}
        <path
          d="M6 40V10h6.5l6.2 16.2L25 10H31.5v16.5H36V40h-7.5V22.8L23.2 38h-2.9L14.9 22.8V40H6z"
          fill="var(--mt-accent)"
        />
        <path
          d="M33.2 27.2 39.8 20.6l2.9 2.9-9.5 9.5-5.6-5.6 2.9-2.9 2.7 2.7z"
          fill="var(--mt-ink)"
        />
      </svg>

      {showWordmark ? (
        <span className="font-display text-[1.65rem] leading-none tracking-tight text-[var(--mt-ink)]">
          MamTo
        </span>
      ) : null}
    </span>
  );
};

export default MamToLogo;

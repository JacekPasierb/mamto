type QuickAddCardProps = {
  onAddClick?: () => void;
};

const QuickAddCard = ({onAddClick}: QuickAddCardProps) => {
  return (
    <section className="mt-rise mt-rise-delay-2 flex flex-col gap-5 border-b border-[var(--mt-line)] py-9 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--mt-muted)]">
          Szybka akcja
        </p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">
          Dodaj rzecz
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--mt-muted)]">
          Pojazd, lek, polisę, wizytę albo własne przypomnienie — zanim wypadnie
          z głowy.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="group relative shrink-0 overflow-hidden bg-[var(--mt-ink)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
      >
        <span className="relative z-10">+ Dodaj rzecz</span>
      </button>
    </section>
  );
};

export default QuickAddCard;

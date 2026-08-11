import Link from "next/link";

import type {Vehicle} from "./VehiclesPage";

type VehicleCardProps = {
  vehicle: Vehicle;
};

const VehicleCard = ({vehicle}: VehicleCardProps) => {
  const typeLabel =
    vehicle.type === "motorcycle"
      ? "Motocykl"
      : vehicle.type === "car"
        ? "Samochód"
        : "Inny pojazd";

  return (
    <article className="group border-b border-[var(--mt-line)] py-7 md:border-r md:px-6 md:first:pl-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
        {typeLabel}
      </p>

      <h2 className="font-display mt-3 text-2xl tracking-tight transition group-hover:text-[var(--mt-accent)]">
        {vehicle.name}
      </h2>

      {(vehicle.brand || vehicle.model) && (
        <p className="mt-1 text-[var(--mt-muted)]">
          {vehicle.brand} {vehicle.model}
        </p>
      )}

      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--mt-muted)]">
          Przebieg
        </p>
        <p className="font-display mt-1 text-xl tabular-nums">
          {vehicle.mileage.toLocaleString("pl-PL")} km
        </p>
      </div>

      <Link
        href={`/vehicles/${vehicle._id}`}
        className="mt-6 inline-flex text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
      >
        Otwórz pojazd →
      </Link>
    </article>
  );
};

export default VehicleCard;

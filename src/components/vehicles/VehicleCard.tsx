import Link from "next/link";

import type {Vehicle} from "./VehiclesPage";
import PolishPlate from "./PolishPlate";

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

  const isMotorcycle = vehicle.type === "motorcycle";

  return (
    <article className="group border-b border-[var(--mt-line)] py-7 md:border-r md:px-6 md:first:pl-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-muted)]">
        {typeLabel}
      </p>

      <h2 className="font-display mt-3 text-2xl tracking-tight transition group-hover:text-[var(--mt-accent)]">
        {vehicle.name}
      </h2>

      {(vehicle.brand || vehicle.model || vehicle.year) && (
        <p className="mt-1 text-[var(--mt-muted)]">
          {[vehicle.brand, vehicle.model, vehicle.year]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="plate-stage mt-6 flex items-center justify-center px-5 py-7">
        <div className="relative z-[1]">
          <PolishPlate
            number={vehicle.plateNumber}
            size="sm"
            stacked={isMotorcycle && Boolean(vehicle.plateNumber)}
          />
        </div>
      </div>

      <div className="mt-6">
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

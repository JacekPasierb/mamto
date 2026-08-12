"use client";

import {useMemo} from "react";
import {
  SERVICE_TYPE_LABELS,
  type ServiceType,
} from "@/lib/serviceTypes";
import {getServiceWorkshopDisplay} from "@/lib/workshopTypes";

type TimelineService = {
  _id: string;
  type: ServiceType;
  title: string;
  mileage: number;
  performedAt: string;
  nextDueMileage: number | null;
  performedBy?: string | null;
  workshopName?: string | null;
};

type ServiceMileageTimelineProps = {
  services: TimelineService[];
  currentMileage: number;
};

type TimelinePoint =
  | {
      kind: "service";
      id: string;
      mileage: number;
      title: string;
      type: ServiceType;
      date: string;
    }
  | {
      kind: "now";
      id: "now";
      mileage: number;
      title: string;
    }
  | {
      kind: "due";
      id: string;
      mileage: number;
      title: string;
      type: ServiceType;
    };

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const ServiceMileageTimeline = ({
  services,
  currentMileage,
}: ServiceMileageTimelineProps) => {
  const points = useMemo(() => {
    const items: TimelinePoint[] = services
      .filter((service) => service.mileage > 0)
      .map((service) => ({
        kind: "service" as const,
        id: service._id,
        mileage: service.mileage,
        title: service.title,
        type: service.type,
        date: service.performedAt,
      }));

    items.push({
      kind: "now",
      id: "now",
      mileage: currentMileage,
      title: "Aktualny przebieg",
    });

    for (const service of services) {
      if (
        service.nextDueMileage != null &&
        service.nextDueMileage > currentMileage
      ) {
        items.push({
          kind: "due",
          id: `due-${service._id}`,
          mileage: service.nextDueMileage,
          title: `Następny: ${service.title}`,
          type: service.type,
        });
      }
    }

    return items.sort((a, b) => a.mileage - b.mileage);
  }, [services, currentMileage]);

  if (points.length === 0) {
    return null;
  }

  const minMileage = points[0].mileage;
  const maxMileage = points[points.length - 1].mileage;
  const span = Math.max(maxMileage - minMileage, 1);
  const nowProgress = Math.min(
    100,
    Math.max(0, ((currentMileage - minMileage) / span) * 100)
  );

  return (
    <section className="mt-16 border-t border-[var(--mt-line)] pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-muted)]">
            Przebieg
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">
            Oś czasu
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[var(--mt-muted)]">
            Historia ułożona według kilometrów — od najniższego do najwyższego
            przebiegu.
          </p>
        </div>
        <p className="font-display text-sm tabular-nums text-[var(--mt-accent)]">
          {minMileage.toLocaleString("pl-PL")} –{" "}
          {maxMileage.toLocaleString("pl-PL")} km
        </p>
      </div>

      <div className="mt-8">
        <div className="relative h-1.5 overflow-hidden bg-[var(--mt-bg-deep)]">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--mt-accent)]"
            style={{width: `${nowProgress}%`}}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-[var(--mt-muted)]">
          <span>{minMileage.toLocaleString("pl-PL")} km</span>
          <span className="text-[var(--mt-accent)]">
            teraz {currentMileage.toLocaleString("pl-PL")} km
          </span>
          <span>{maxMileage.toLocaleString("pl-PL")} km</span>
        </div>
      </div>

      <ol className="relative mt-10">
        <span className="absolute top-2 bottom-2 left-[0.35rem] w-px bg-[var(--mt-line)]" />

        {points.map((point) => {
          const sourceService =
            point.kind === "service"
              ? services.find((service) => service._id === point.id)
              : null;
          const workshopDisplay = sourceService
            ? getServiceWorkshopDisplay(sourceService)
            : null;

          return (
          <li key={point.id} className="relative flex gap-5 py-5 pl-1">
            <span
              className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm ${
                point.kind === "now"
                  ? "bg-[var(--mt-accent)] ring-4 ring-[var(--mt-accent-soft)]"
                  : point.kind === "due"
                    ? "border border-[var(--mt-signal)] bg-white"
                    : "bg-[var(--mt-ink)]"
              }`}
            />

            <div className="min-w-0 flex-1 border-b border-[var(--mt-line)] pb-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <p className="font-display text-xl tabular-nums tracking-tight">
                  {point.mileage.toLocaleString("pl-PL")}{" "}
                  <span className="text-sm text-[var(--mt-muted)]">km</span>
                </p>
                {point.kind === "service" ? (
                  <p className="text-sm text-[var(--mt-muted)]">
                    {formatDate(point.date)}
                  </p>
                ) : null}
              </div>

              <p
                className={`mt-2 text-sm ${
                  point.kind === "now"
                    ? "font-medium text-[var(--mt-accent)]"
                    : point.kind === "due"
                      ? "text-[var(--mt-signal)]"
                      : "text-[var(--mt-ink)]"
                }`}
              >
                {point.kind === "service"
                  ? `${SERVICE_TYPE_LABELS[point.type]} · ${point.title}`
                  : point.title}
              </p>

              {workshopDisplay ? (
                <p className="mt-1 text-xs text-[var(--mt-muted)]">
                  {workshopDisplay.label}: {workshopDisplay.value}
                </p>
              ) : null}

              {point.kind === "due" ? (
                <p className="mt-1 text-xs text-[var(--mt-muted)]">
                  Planowany przebieg · {SERVICE_TYPE_LABELS[point.type]}
                </p>
              ) : null}
            </div>
          </li>
        );
        })}
      </ol>
    </section>
  );
};

export default ServiceMileageTimeline;

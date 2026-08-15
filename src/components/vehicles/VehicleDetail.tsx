"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo, useState} from "react";

import {
  SERVICE_GROUP_LABELS,
  SERVICE_GROUP_TYPES,
  SERVICE_GROUPS,
  SERVICE_TYPE_LABELS,
  getServiceGroup,
  type ServiceGroup,
  type ServiceType,
} from "@/lib/serviceTypes";
import {
  getServiceWorkshopDisplay,
} from "@/lib/workshopTypes";
import {
  IconFleet,
  IconMileage,
  VehicleKindIcon,
  VehicleServiceIcon,
  type VehicleServiceIconId,
} from "@/components/icons/VehicleIcons";
import PolishPlate from "./PolishPlate";
import ServiceFormModal, {type ServiceFormValues} from "./ServiceFormModal";
import ServiceMileageTimeline from "./ServiceMileageTimeline";
import VehicleFormModal, {type VehicleFormValues} from "./VehicleFormModal";

export type VehicleDetailData = {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  vin: string;
  plateNumber: string;
  mileage: number;
  type: "car" | "motorcycle" | "other";
};

type VehicleServiceItem = ServiceFormValues & {
  type: ServiceType;
};

type ServiceTab = "all" | ServiceGroup;

type VehicleDetailProps = {
  vehicle: VehicleDetailData;
};

const SERVICES_PER_PAGE = 8;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const isServiceOverdue = (service: VehicleServiceItem, currentMileage: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (service.nextDueAt) {
    const due = new Date(service.nextDueAt);
    due.setHours(0, 0, 0, 0);
    if (due.getTime() < today.getTime()) return true;
  }

  if (
    service.nextDueMileage != null &&
    service.nextDueMileage <= currentMileage
  ) {
    return true;
  }

  return false;
};

const VehicleDetail = ({vehicle: initialVehicle}: VehicleDetailProps) => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [mileage, setMileage] = useState(initialVehicle.mileage);
  const [services, setServices] = useState<VehicleServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ServiceTab>("all");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<VehicleServiceItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const loadServices = useCallback(async () => {
    const response = await fetch(`/api/vehicles/${vehicle._id}/services`);

    if (!response.ok) {
      throw new Error("Nie udało się pobrać serwisów");
    }

    const data = await response.json();
    setServices(data);

    const maxMileage = data.reduce(
      (max: number, item: VehicleServiceItem) =>
        Math.max(max, item.mileage || 0),
      vehicle.mileage
    );
    setMileage(Math.max(maxMileage, vehicle.mileage));
  }, [vehicle._id, vehicle.mileage]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await loadServices();
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadServices]);

  const counts = useMemo(() => {
    const result: Record<ServiceTab, number> = {
      all: services.length,
      maintenance: 0,
      repairs: 0,
      inspections: 0,
    };

    for (const service of services) {
      result[getServiceGroup(service.type)] += 1;
    }

    return result;
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return services;
    return services.filter((service) =>
      SERVICE_GROUP_TYPES[activeTab].includes(service.type)
    );
  }, [services, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / SERVICES_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * SERVICES_PER_PAGE;
    return filteredServices.slice(start, start + SERVICES_PER_PAGE);
  }, [filteredServices, currentPage]);

  const handleTabChange = (tab: ServiceTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabs: {id: ServiceTab; label: string}[] = [
    {id: "all", label: "Wszystko"},
    ...SERVICE_GROUPS.map((group) => ({
      id: group as ServiceTab,
      label: SERVICE_GROUP_LABELS[group],
    })),
  ];

  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: VehicleServiceItem) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = async (service: VehicleServiceItem) => {
    const confirmed = window.confirm(
      `Usunąć serwis „${service.title}”? Tej operacji nie da się cofnąć.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(service._id);

      const response = await fetch(
        `/api/vehicles/${vehicle._id}/services/${service._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Nie udało się usunąć serwisu");
      }

      await loadServices();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć serwisu.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleVehicleSaved = async (saved?: VehicleFormValues) => {
    if (!saved) return;

    setVehicle(saved);
    setMileage(saved.mileage);
    await loadServices();
  };

  const handleDeleteVehicle = async () => {
    const confirmed = window.confirm(
      `Usunąć pojazd „${vehicle.name}” wraz z historią serwisową? Tej operacji nie da się cofnąć.`
    );

    if (!confirmed) return;

    try {
      setIsDeletingVehicle(true);

      const response = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć pojazdu");
      }

      router.push("/vehicles");
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Nie udało się usunąć pojazdu.");
      setIsDeletingVehicle(false);
    }
  };

  const typeLabel =
    vehicle.type === "motorcycle"
      ? "Motocykl"
      : vehicle.type === "car"
        ? "Samochód"
        : "Inny pojazd";

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/vehicles"
          className="text-sm text-[var(--mt-muted)] transition hover:text-[var(--mt-accent)]"
        >
          ← Pojazdy
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="mt-vehicle-mark"
              style={{color: "var(--mt-accent)"}}
            >
              <VehicleKindIcon
                id={
                  vehicle.type === "motorcycle"
                    ? "motorcycle"
                    : vehicle.type === "other"
                      ? "other"
                      : "car"
                }
              />
            </span>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
                Serwis pojazdu · {typeLabel}
              </p>

              <h1 className="font-display mt-3 text-4xl tracking-tight">
                {vehicle.name}
              </h1>

              <p className="mt-2 text-[var(--mt-muted)]">
                {[vehicle.brand, vehicle.model, vehicle.year]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setIsVehicleModalOpen(true)}
              className="text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
            >
              Edytuj pojazd
            </button>
            <button
              type="button"
              onClick={handleDeleteVehicle}
              disabled={isDeletingVehicle}
              className="text-sm font-medium text-[var(--mt-signal)] underline-offset-4 transition hover:underline disabled:opacity-50"
            >
              {isDeletingVehicle ? "Usuwanie…" : "Usuń pojazd"}
            </button>
          </div>
        </div>

        <div className="plate-stage mt-10 px-6 py-10 sm:px-10">
          <div className="relative z-[1] flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex w-full flex-col items-center sm:items-start">
              <p className="mb-4 text-[0.65rem] uppercase tracking-[0.24em] text-[var(--mt-muted)]">
                Tablica rejestracyjna
              </p>
              <PolishPlate
                number={vehicle.plateNumber}
                size="lg"
                stacked={
                  vehicle.type === "motorcycle" && Boolean(vehicle.plateNumber)
                }
              />
            </div>

            <div className="grid w-full grid-cols-3 gap-4 text-center sm:max-w-md sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <span
                  className="mt-vehicle-mark !h-9 !w-9"
                  style={{color: "var(--mt-ink)"}}
                >
                  <IconMileage className="!h-[1.15rem] !w-[1.15rem]" />
                </span>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--mt-muted)]">
                    Przebieg
                  </p>
                  <p className="font-display mt-1 text-2xl tabular-nums text-[var(--mt-ink)]">
                    {mileage.toLocaleString("pl-PL")}
                    <span className="ml-1 text-sm font-sans text-[var(--mt-muted)]">
                      km
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--mt-muted)]">
                  Rocznik
                </p>
                <p className="font-display mt-2 text-2xl tabular-nums text-[var(--mt-ink)]">
                  {vehicle.year ?? "—"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--mt-muted)]">
                  VIN
                </p>
                <p
                  className="mt-2 truncate font-mono text-xs tracking-wide text-[var(--mt-ink)]/80"
                  title={vehicle.vin || undefined}
                >
                  {vehicle.vin || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="mt-vehicle-mark"
              style={{color: "var(--mt-ink)"}}
            >
              <IconFleet />
            </span>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Serwis</h2>
              <p className="mt-2 text-[var(--mt-muted)]">
                {vehicle.type === "motorcycle"
                  ? "Olej, łańcuch, zawory, opony i inne czynności."
                  : "Olej, wycieraczki, filtry, opony i inne czynności."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="shrink-0 bg-[var(--mt-ink)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)]"
          >
            + Dodaj serwis
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filtr serwisów"
          className="mt-8 flex gap-1 overflow-x-auto border-b border-[var(--mt-line)] pb-px"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const iconId: VehicleServiceIconId =
              tab.id === "maintenance"
                ? "maintenance"
                : tab.id === "repairs"
                  ? "repairs"
                  : tab.id === "inspections"
                    ? "inspections"
                    : "all";

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-sm transition sm:px-4 ${
                  isActive
                    ? "font-medium text-[var(--mt-ink)]"
                    : "text-[var(--mt-muted)] hover:text-[var(--mt-ink)]"
                }`}
              >
                <VehicleServiceIcon
                  id={iconId}
                  className="mt-vehicle-tab-icon"
                />
                <span>{tab.label}</span>
                <span
                  className={`tabular-nums ${
                    isActive
                      ? "text-[var(--mt-accent)]"
                      : "text-[var(--mt-muted)]/70"
                  }`}
                >
                  {counts[tab.id]}
                </span>
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--mt-accent)]" />
                ) : null}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--mt-muted)]">
            Ładowanie historii…
          </p>
        ) : services.length === 0 ? (
          <div className="mt-6 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-sm text-[var(--mt-muted)]">
              Nie masz jeszcze żadnych wpisów serwisowych.
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="mt-6 border border-dashed border-[var(--mt-line)] bg-white/40 px-6 py-14 text-center">
            <p className="text-sm text-[var(--mt-muted)]">
              Brak wpisów w kategorii „
              {activeTab === "all"
                ? "Wszystko"
                : SERVICE_GROUP_LABELS[activeTab]}
              ”.
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--mt-line)] border-b border-[var(--mt-line)]">
            {paginatedServices.map((service) => {
              const workshopDisplay = getServiceWorkshopDisplay(service);
              const overdue = isServiceOverdue(service, mileage);

              return (
              <li key={service._id} className="py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mt-accent)]">
                        {SERVICE_TYPE_LABELS[service.type]}
                      </p>
                      {overdue ? (
                        <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--mt-signal)]">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M12 3.5 21 19H3L12 3.5Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 10v4.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <circle cx="12" cy="17" r="1" fill="currentColor" />
                          </svg>
                          Po terminie
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-display mt-2 text-xl tracking-tight">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--mt-muted)]">
                      {formatDate(service.performedAt)}
                      {service.mileage
                        ? ` · ${service.mileage.toLocaleString("pl-PL")} km`
                        : ""}
                      {service.cost != null
                        ? ` · ${service.cost.toLocaleString("pl-PL", {
                            style: "currency",
                            currency: "PLN",
                          })}`
                        : ""}
                    </p>
                    {workshopDisplay ? (
                      <p className="mt-1 text-sm text-[var(--mt-muted)]">
                        <span className="font-medium text-[var(--mt-ink)]">
                          {workshopDisplay.label}:
                        </span>{" "}
                        {workshopDisplay.value}
                      </p>
                    ) : null}
                    {(service.nextDueAt || service.nextDueMileage != null) && (
                      <p
                        className={`mt-2 text-sm ${
                          overdue
                            ? "font-medium text-[var(--mt-signal)]"
                            : "text-[var(--mt-ink)]"
                        }`}
                      >
                        Następny:{" "}
                        {service.nextDueAt
                          ? formatDate(service.nextDueAt)
                          : null}
                        {service.nextDueAt && service.nextDueMileage != null
                          ? " · "
                          : ""}
                        {service.nextDueMileage != null
                          ? `${service.nextDueMileage.toLocaleString("pl-PL")} km`
                          : null}
                        {overdue ? " · po terminie" : ""}
                      </p>
                    )}
                    {service.notes ? (
                      <p className="mt-2 text-sm text-[var(--mt-muted)]">
                        {service.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 gap-4 self-start">
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="text-sm font-medium text-[var(--mt-accent)] underline-offset-4 transition hover:underline"
                    >
                      Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      disabled={deletingId === service._id}
                      className="text-sm font-medium text-[var(--mt-signal)] underline-offset-4 transition hover:underline disabled:opacity-50"
                    >
                      {deletingId === service._id ? "Usuwanie…" : "Usuń"}
                    </button>
                  </div>
                </div>
              </li>
            );
            })}
          </ul>
        )}

        {!isLoading && filteredServices.length > SERVICES_PER_PAGE ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--mt-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--mt-muted)]">
              Strona {currentPage} z {totalPages}
              <span className="text-[var(--mt-muted)]/80">
                {" "}
                · {filteredServices.length} wpisów
              </span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="border border-[var(--mt-line)] px-4 py-2 text-sm font-medium text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Poprzednia
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage >= totalPages}
                className="border border-[var(--mt-line)] px-4 py-2 text-sm font-medium text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Następna
              </button>
            </div>
          </div>
        ) : null}

        {!isLoading && services.length > 0 ? (
          <ServiceMileageTimeline
            services={services}
            currentMileage={mileage}
          />
        ) : null}
      </div>

      <ServiceFormModal
        vehicleId={vehicle._id}
        vehicleKind={vehicle.type}
        currentMileage={mileage}
        isOpen={isModalOpen}
        service={editingService}
        onClose={closeModal}
        onSaved={loadServices}
      />

      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        vehicle={vehicle}
        onClose={() => setIsVehicleModalOpen(false)}
        onSaved={handleVehicleSaved}
      />
    </>
  );
};

export default VehicleDetail;

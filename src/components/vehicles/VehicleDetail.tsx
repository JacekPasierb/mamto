"use client";

import Link from "next/link";
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
import ServiceFormModal, {type ServiceFormValues} from "./ServiceFormModal";
import ServiceMileageTimeline from "./ServiceMileageTimeline";

export type VehicleDetailData = {
  _id: string;
  name: string;
  brand: string;
  model: string;
  mileage: number;
};

type VehicleServiceItem = ServiceFormValues & {
  type: ServiceType;
};

type ServiceTab = "all" | ServiceGroup;

type VehicleDetailProps = {
  vehicle: VehicleDetailData;
};

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

const VehicleDetail = ({vehicle}: VehicleDetailProps) => {
  const [mileage, setMileage] = useState(vehicle.mileage);
  const [services, setServices] = useState<VehicleServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ServiceTab>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<VehicleServiceItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setMileage(maxMileage);
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

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/vehicles"
          className="text-sm text-[var(--mt-muted)] transition hover:text-[var(--mt-accent)]"
        >
          ← Pojazdy
        </Link>

        <p className="mt-8 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--mt-accent)]">
          Serwis pojazdu
        </p>

        <h1 className="font-display mt-3 text-4xl tracking-tight">
          {vehicle.name}
        </h1>

        <p className="mt-2 text-[var(--mt-muted)]">
          {vehicle.brand} {vehicle.model}
        </p>

        <div className="mt-10 border-y border-[var(--mt-line)] py-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--mt-muted)]">
            Aktualny przebieg
          </p>
          <p className="font-display mt-2 text-3xl tabular-nums">
            {mileage.toLocaleString("pl-PL")} km
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Serwis</h2>
            <p className="mt-2 text-[var(--mt-muted)]">
              Olej, wycieraczki, filtry, opony i inne czynności.
            </p>
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

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 px-3 py-3 text-sm transition sm:px-4 ${
                  isActive
                    ? "font-medium text-[var(--mt-ink)]"
                    : "text-[var(--mt-muted)] hover:text-[var(--mt-ink)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 tabular-nums ${
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
            {filteredServices.map((service) => {
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

        {!isLoading && services.length > 0 ? (
          <ServiceMileageTimeline
            services={filteredServices}
            currentMileage={mileage}
          />
        ) : null}
      </div>

      <ServiceFormModal
        vehicleId={vehicle._id}
        currentMileage={mileage}
        isOpen={isModalOpen}
        service={editingService}
        onClose={closeModal}
        onSaved={loadServices}
      />
    </>
  );
};

export default VehicleDetail;

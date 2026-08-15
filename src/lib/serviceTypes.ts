export const SERVICE_TYPES = [
  // Eksploatacja — oleje i filtry
  "oil",
  "oil_filter",
  "cabin_filter",
  "fuel_filter",
  "air_filter",
  "filters",
  // Eksploatacja — płyny
  "brake_fluid",
  "coolant",
  "power_steering_fluid",
  "transmission_oil",
  "differential_oil",
  "fork_oil",
  // Eksploatacja — układ napędowy / zapłon
  "timing_belt",
  "spark_plugs",
  "glow_plugs",
  "drive_chain",
  "sprockets",
  "valve_clearance",
  // Eksploatacja — hamulce okresowe
  "brake_pads",
  "brake_discs",
  // Eksploatacja — inne okresowe
  "battery",
  "tires",
  "wipers",
  "ac_service",
  // Naprawy — obszary
  "engine",
  "turbo",
  "fuel_system",
  "cooling",
  "exhaust",
  "transmission",
  "clutch",
  "drivetrain",
  "suspension",
  "steering",
  "brakes_repair",
  "electrical",
  "starter_alternator",
  "ac_repair",
  "bodywork",
  "glass",
  "interior",
  "wheels_tires_repair",
  "fairings",
  "instrument_cluster",
  "diagnostics",
  "other",
  // Legacy naprawy (stare wpisy)
  "brakes",
  "repair",
  // Przeglądy
  "inspection",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export type VehicleKind = "car" | "motorcycle" | "other";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  oil: "Olej silnikowy",
  oil_filter: "Filtr oleju",
  cabin_filter: "Filtr kabinowy",
  fuel_filter: "Filtr paliwa",
  air_filter: "Filtr powietrza",
  filters: "Filtry",
  brake_fluid: "Płyn hamulcowy",
  coolant: "Płyn chłodniczy",
  power_steering_fluid: "Płyn wspomagania",
  transmission_oil: "Olej skrzyni biegów",
  differential_oil: "Olej mostu / dyferencjału",
  fork_oil: "Olej w widelcu",
  timing_belt: "Rozrząd",
  spark_plugs: "Świece zapłonowe",
  glow_plugs: "Świece żarowe",
  drive_chain: "Łańcuch napędowy",
  sprockets: "Zębatki",
  valve_clearance: "Regulacja zaworów",
  brake_pads: "Klocki hamulcowe",
  brake_discs: "Tarcze hamulcowe",
  battery: "Akumulator",
  tires: "Opony",
  wipers: "Wycieraczki",
  ac_service: "Klimatyzacja (serwis)",
  engine: "Silnik",
  turbo: "Turbo / doładowanie",
  fuel_system: "Układ paliwowy",
  cooling: "Układ chłodzenia",
  exhaust: "Układ wydechowy",
  transmission: "Skrzynia biegów",
  clutch: "Sprzęgło",
  drivetrain: "Napęd / półosie",
  suspension: "Zawieszenie",
  steering: "Układ kierowniczy",
  brakes_repair: "Układ hamulcowy",
  electrical: "Elektryka",
  starter_alternator: "Rozrusznik / alternator",
  ac_repair: "Klimatyzacja",
  bodywork: "Blacharka / lakier",
  glass: "Szyby",
  interior: "Wnętrze",
  wheels_tires_repair: "Koła / opony (naprawa)",
  fairings: "Owiewki / karoseria",
  instrument_cluster: "Licznik / zegary",
  diagnostics: "Diagnostyka",
  other: "Inne",
  brakes: "Hamulce",
  repair: "Naprawa",
  inspection: "Przegląd",
};

export type ServiceInterval = {
  months: number;
  km: number;
};

/** Typowe interwały wymiany — używane przy domyślnym następnym terminie. */
export const SERVICE_INTERVALS: Partial<Record<ServiceType, ServiceInterval>> = {
  oil: {months: 12, km: 15000},
  oil_filter: {months: 12, km: 15000},
  cabin_filter: {months: 12, km: 15000},
  fuel_filter: {months: 24, km: 30000},
  air_filter: {months: 12, km: 15000},
  filters: {months: 12, km: 15000},
  brake_fluid: {months: 24, km: 0},
  coolant: {months: 36, km: 60000},
  power_steering_fluid: {months: 36, km: 60000},
  transmission_oil: {months: 60, km: 60000},
  differential_oil: {months: 60, km: 60000},
  fork_oil: {months: 24, km: 20000},
  timing_belt: {months: 60, km: 100000},
  spark_plugs: {months: 36, km: 40000},
  glow_plugs: {months: 60, km: 100000},
  drive_chain: {months: 12, km: 15000},
  sprockets: {months: 24, km: 20000},
  valve_clearance: {months: 24, km: 24000},
  brake_pads: {months: 0, km: 30000},
  brake_discs: {months: 0, km: 60000},
  battery: {months: 48, km: 0},
  tires: {months: 48, km: 40000},
  wipers: {months: 12, km: 0},
  ac_service: {months: 24, km: 0},
  brakes: {months: 24, km: 30000},
  inspection: {months: 12, km: 0},
};

/** Krótsze interwały typowe dla motocykli. */
export const MOTORCYCLE_SERVICE_INTERVALS: Partial<
  Record<ServiceType, ServiceInterval>
> = {
  oil: {months: 6, km: 6000},
  oil_filter: {months: 6, km: 6000},
  air_filter: {months: 12, km: 10000},
  spark_plugs: {months: 24, km: 12000},
  brake_fluid: {months: 24, km: 0},
  coolant: {months: 24, km: 24000},
  fork_oil: {months: 24, km: 20000},
  drive_chain: {months: 12, km: 15000},
  sprockets: {months: 24, km: 20000},
  valve_clearance: {months: 24, km: 24000},
  brake_pads: {months: 0, km: 15000},
  brake_discs: {months: 0, km: 30000},
  battery: {months: 36, km: 0},
  tires: {months: 36, km: 15000},
  inspection: {months: 12, km: 0},
};

export function getServiceInterval(
  type: ServiceType,
  vehicleKind: VehicleKind = "car"
): ServiceInterval | undefined {
  if (vehicleKind === "motorcycle") {
    return (
      MOTORCYCLE_SERVICE_INTERVALS[type] || SERVICE_INTERVALS[type]
    );
  }

  return SERVICE_INTERVALS[type];
}

export const SERVICE_GROUPS = [
  "maintenance",
  "repairs",
  "inspections",
] as const;

export type ServiceGroup = (typeof SERVICE_GROUPS)[number];

export const SERVICE_GROUP_LABELS: Record<ServiceGroup, string> = {
  maintenance: "Eksploatacja",
  repairs: "Naprawy",
  inspections: "Przeglądy",
};

export const SERVICE_GROUP_TYPES: Record<ServiceGroup, ServiceType[]> = {
  maintenance: [
    "oil",
    "oil_filter",
    "cabin_filter",
    "fuel_filter",
    "air_filter",
    "filters",
    "brake_fluid",
    "coolant",
    "power_steering_fluid",
    "transmission_oil",
    "differential_oil",
    "fork_oil",
    "timing_belt",
    "spark_plugs",
    "glow_plugs",
    "drive_chain",
    "sprockets",
    "valve_clearance",
    "brake_pads",
    "brake_discs",
    "battery",
    "tires",
    "wipers",
    "ac_service",
  ],
  repairs: [
    "engine",
    "turbo",
    "fuel_system",
    "cooling",
    "exhaust",
    "transmission",
    "clutch",
    "drivetrain",
    "suspension",
    "steering",
    "brakes_repair",
    "electrical",
    "starter_alternator",
    "ac_repair",
    "bodywork",
    "glass",
    "interior",
    "wheels_tires_repair",
    "fairings",
    "instrument_cluster",
    "diagnostics",
    "other",
    "brakes",
    "repair",
  ],
  inspections: ["inspection"],
};

export function getServiceGroup(type: ServiceType): ServiceGroup {
  if (SERVICE_GROUP_TYPES.inspections.includes(type)) {
    return "inspections";
  }

  if (SERVICE_GROUP_TYPES.repairs.includes(type)) {
    return "repairs";
  }

  return "maintenance";
}

const CAR_FORM_GROUPS: {
  group: ServiceGroup;
  types: ServiceType[];
}[] = [
  {
    group: "maintenance",
    types: [
      "oil",
      "oil_filter",
      "cabin_filter",
      "fuel_filter",
      "air_filter",
      "brake_fluid",
      "coolant",
      "power_steering_fluid",
      "transmission_oil",
      "differential_oil",
      "timing_belt",
      "spark_plugs",
      "glow_plugs",
      "brake_pads",
      "brake_discs",
      "battery",
      "tires",
      "wipers",
      "ac_service",
    ],
  },
  {
    group: "repairs",
    types: [
      "engine",
      "turbo",
      "fuel_system",
      "cooling",
      "exhaust",
      "transmission",
      "clutch",
      "drivetrain",
      "suspension",
      "steering",
      "brakes_repair",
      "electrical",
      "starter_alternator",
      "ac_repair",
      "bodywork",
      "glass",
      "interior",
      "wheels_tires_repair",
      "diagnostics",
      "instrument_cluster",
      "other",
    ],
  },
  {
    group: "inspections",
    types: ["inspection"],
  },
];

const MOTORCYCLE_FORM_GROUPS: {
  group: ServiceGroup;
  types: ServiceType[];
}[] = [
  {
    group: "maintenance",
    types: [
      "oil",
      "oil_filter",
      "air_filter",
      "spark_plugs",
      "drive_chain",
      "sprockets",
      "valve_clearance",
      "brake_fluid",
      "coolant",
      "fork_oil",
      "brake_pads",
      "brake_discs",
      "battery",
      "tires",
    ],
  },
  {
    group: "repairs",
    types: [
      "engine",
      "fuel_system",
      "cooling",
      "exhaust",
      "transmission",
      "clutch",
      "drivetrain",
      "suspension",
      "brakes_repair",
      "electrical",
      "starter_alternator",
      "instrument_cluster",
      "fairings",
      "wheels_tires_repair",
      "diagnostics",
      "other",
    ],
  },
  {
    group: "inspections",
    types: ["inspection"],
  },
];

/** @deprecated Używaj getServiceFormGroups(vehicleKind) */
export const SERVICE_FORM_GROUPS = CAR_FORM_GROUPS;

export function getServiceFormGroups(vehicleKind: VehicleKind = "car") {
  if (vehicleKind === "motorcycle") {
    return MOTORCYCLE_FORM_GROUPS;
  }

  return CAR_FORM_GROUPS;
}

/**
 * Dane operatora — uzupełnij przed produkcją / publikacją.
 * Dokumenty prawne odwołują się do tych wartości.
 */
export const LEGAL = {
  appName: "MamTo",
  siteUrl: "https://mamto.app",
  effectiveDate: "15 sierpnia 2026 r.",

  /** Pełna nazwa administratora / usługodawcy */
  operatorName: "[Nazwa firmy lub Imię i nazwisko]",
  operatorForm: "[np. jednoosobowa działalność gospodarcza / sp. z o.o.]",
  operatorAddress: "[ulica, kod, miasto, kraj]",
  operatorNip: "[NIP]",
  operatorKrs: "", // opcjonalnie
  operatorEmail: "kontakt@mamto.app",
  operatorPhone: "", // opcjonalnie

  /** Hosting / infrastruktura (do polityki prywatności) */
  processors: [
    {
      name: "Clerk, Inc.",
      role: "uwierzytelnianie i zarządzanie kontami użytkowników",
      region: "USA / EOG (zależnie od konfiguracji)",
    },
    {
      name: "MongoDB Atlas (MongoDB, Inc.)",
      role: "przechowywanie danych aplikacji",
      region: "EOG lub inny region wskazany w panelu Atlas",
    },
    {
      name: "Dostawca hostingu aplikacji (np. Vercel / inny)",
      role: "hosting frontendu i API",
      region: "zgodnie z umową hostingu",
    },
  ],
} as const;

export const LEGAL_LINKS = [
  {href: "/regulamin", label: "Regulamin"},
  {href: "/polityka-prywatnosci", label: "Polityka prywatności"},
  {href: "/cookies", label: "Cookies"},
] as const;

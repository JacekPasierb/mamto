/**
 * Dane operatora — uzupełnij przed produkcją / publikacją.
 * Dokumenty prawne odwołują się do tych wartości.
 */
export const LEGAL = {
  appName: "MamTo",
  siteUrl: "https://mam-to.netlify.app",
  effectiveDate: "27 września 2026 r.",

  /** Pełna nazwa administratora / usługodawcy */
  operatorName: "Jacek Pasierb",
  operatorForm: "osoba fizyczna",
  operatorAddress: "",
  operatorNip: "",
  operatorKrs: "",
  operatorEmail: "kontakt@pasierb-webstudio.pl",
  operatorPhone: "",

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
      name: "Netlify, Inc.",
      role: "hosting frontendu i API",
      region: "zgodnie z umową Netlify",
    },
  ],
} as const;

export const LEGAL_LINKS = [
  {href: "/regulamin", label: "Regulamin"},
  {href: "/polityka-prywatnosci", label: "Polityka prywatności"},
  {href: "/cookies", label: "Cookies"},
] as const;

/** Tokens visuels alignés sur la page d'accueil (landing). */

export const platform = {
  page: (dark: boolean) =>
    dark
      ? "bg-[#101828] text-gray-100"
      : "bg-gradient-to-b from-[#F0F4FF] via-white to-white text-gray-800",

  sidebar: (dark: boolean) =>
    dark
      ? "bg-dark-primary border-gray-800 text-gray-100"
      : "bg-white border-gray-100 text-gray-800",

  header: (dark: boolean) =>
    dark
      ? "bg-dark-primary/95 border-gray-800 text-gray-100"
      : "bg-white/95 border-gray-100 text-gray-800",

  card: (dark: boolean) =>
    dark
      ? "bg-dark-primary border-gray-800 text-white"
      : "bg-white border-gray-100 text-gray-800 shadow-theme-sm",

  cardNested: (dark: boolean) =>
    dark
      ? "bg-dark-secondary border-gray-800"
      : "bg-gray-50 border-gray-200",

  border: (dark: boolean) => (dark ? "border-gray-800" : "border-gray-100"),

  borderSubtle: (dark: boolean) => (dark ? "border-gray-800/60" : "border-gray-200"),

  textPrimary: (dark: boolean) => (dark ? "text-white" : "text-gray-900"),

  textSecondary: (dark: boolean) => (dark ? "text-gray-300" : "text-gray-600"),

  textMuted: (dark: boolean) => (dark ? "text-gray-400" : "text-gray-500"),

  sectionLabel: (dark: boolean) =>
    `text-[10px] uppercase font-bold tracking-wider font-sans ${dark ? "text-gray-500" : "text-gray-500"}`,

  navActive: "bg-primary-500 text-white font-semibold shadow-md",

  navInactive: (dark: boolean) =>
    dark
      ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",

  hero: (dark: boolean) =>
    dark
      ? "bg-gradient-to-br from-primary-500/15 to-dark-primary border-primary-500/10 text-white"
      : "bg-gradient-to-br from-primary-50 to-primary-100/60 border-primary-100 text-gray-800",

  heroTitle: (dark: boolean) =>
    dark ? "text-white" : "text-gray-900",

  heroSubtitle: (dark: boolean) =>
    dark ? "text-gray-300" : "text-primary-900/80",

  input: (dark: boolean) =>
    dark
      ? "bg-dark-secondary border-gray-800 text-gray-100 focus:border-primary-500 focus:outline-none"
      : "bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none",

  buttonPrimary: "bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors",

  buttonGhost: (dark: boolean) =>
    dark
      ? "border-gray-800 text-gray-400 hover:bg-white/5 hover:text-white"
      : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900",

  footer: (dark: boolean) =>
    dark
      ? "bg-dark-primary border-gray-800 text-gray-500"
      : "bg-gray-50 border-gray-100 text-gray-500",

  overlay: "bg-[#101828]/60",

  success: (dark: boolean) =>
    dark ? "text-primary-400" : "text-primary-600",

  successBadge: (dark: boolean) =>
    dark
      ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
      : "bg-primary-50 text-primary-700 border-primary-200",

  highlightCard: (dark: boolean) =>
    dark
      ? "bg-dark-secondary border-primary-500/35 text-gray-100"
      : "bg-primary-50/50 border-primary-300 text-gray-900",

  historyItem: (dark: boolean, active: boolean) =>
    `bg-dark-secondary border py-2.5 px-3 rounded-lg text-left text-xs transition-all ${
      active
        ? "border-primary-500/60 ring-1 ring-primary-500/30"
        : dark
          ? "border-gray-800 hover:border-gray-700"
          : "border-gray-200 hover:border-gray-300"
    }`,
} as const;

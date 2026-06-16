/** Visual tokens aligned with the landing page (PawaPay-style dashboard density). */

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
      ? "bg-dark-primary/95 border-gray-800 text-gray-100 backdrop-blur"
      : "bg-white/95 border-gray-100 text-gray-800 backdrop-blur",

  /** Primary content card — matches landing `rounded-[20px]` panels */
  panel: (dark: boolean) =>
    dark
      ? "rounded-[20px] border border-gray-800 bg-dark-primary text-white"
      : "rounded-[20px] border border-gray-200 bg-white text-gray-800 shadow-theme-sm",

  panelPadding: "p-6 sm:p-8",

  card: (dark: boolean) =>
    dark
      ? "rounded-[20px] border border-gray-800 bg-dark-primary text-white"
      : "rounded-[20px] border border-gray-200 bg-white text-gray-800 shadow-theme-sm",

  cardNested: (dark: boolean) =>
    dark
      ? "rounded-2xl border border-gray-800 bg-dark-secondary"
      : "rounded-2xl border border-gray-200 bg-gray-50",

  border: (dark: boolean) => (dark ? "border-gray-800" : "border-gray-200"),

  borderSubtle: (dark: boolean) => (dark ? "border-gray-800/80" : "border-gray-100"),

  textPrimary: (dark: boolean) => (dark ? "text-white/90" : "text-gray-900"),

  textSecondary: (dark: boolean) => (dark ? "text-gray-300" : "text-gray-600"),

  textMuted: (dark: boolean) => (dark ? "text-gray-400" : "text-gray-500"),

  sectionLabel: (dark: boolean) =>
    `text-xs font-semibold uppercase tracking-wide px-2 mb-2 ${dark ? "text-gray-500" : "text-gray-400"}`,

  pageTitle: (dark: boolean) =>
    `text-xl font-bold font-display tracking-tight ${dark ? "text-white/90" : "text-gray-900"}`,

  pageSubtitle: (dark: boolean) =>
    `text-sm leading-relaxed mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`,

  fieldLabel: (dark: boolean) =>
    `text-xs font-semibold uppercase tracking-wide block mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`,

  navActive: (dark: boolean) =>
    dark
      ? "bg-white/10 text-white font-medium"
      : "bg-primary-50 text-primary-700 font-medium border border-primary-100",

  navInactive: (dark: boolean) =>
    dark
      ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",

  navItem:
    "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",

  input: (dark: boolean) =>
    dark
      ? "w-full rounded-xl border border-gray-800 bg-dark-secondary px-3 py-2.5 text-sm text-gray-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      : "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",

  buttonPrimary:
    "inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none text-white font-medium rounded-full px-6 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2",

  buttonGradient:
    "gradient-btn inline-flex items-center justify-center text-white font-medium rounded-full px-6 py-2.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none",

  buttonSecondary: (dark: boolean) =>
    dark
      ? "inline-flex items-center justify-center rounded-full border border-gray-700 bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
      : "inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors",

  buttonDark:
    "inline-flex items-center justify-center rounded-full bg-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 transition-colors disabled:opacity-40",

  pricingCard: (dark: boolean, highlighted: boolean) =>
    `relative flex h-full flex-col rounded-[20px] shadow-theme-xs ${
      highlighted
        ? "border-2 border-primary-500"
        : dark
          ? "border border-gray-800 bg-dark-primary"
          : "border border-gray-200 bg-white"
    } ${dark && !highlighted ? "bg-dark-primary" : !highlighted ? "bg-white" : dark ? "bg-dark-primary" : "bg-white"}`,

  segmentTrack: (dark: boolean) =>
    `flex rounded-full p-1 shadow-theme-xs ${
      dark ? "bg-[#1D2939]" : "bg-white"
    }`,

  segmentActive: "rounded-full bg-gray-800 px-6 py-2 text-sm font-medium text-white dark:bg-white/[0.05]",

  segmentInactive: (dark: boolean) =>
    `rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
      dark ? "text-gray-400 hover:text-gray-200" : "text-gray-700 hover:text-gray-900"
    }`,

  buttonGhost: (dark: boolean) =>
    dark
      ? "border border-gray-700 text-gray-400 hover:bg-white/5 hover:text-white rounded-full"
      : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-full",

  footer: (dark: boolean) =>
    dark
      ? "bg-dark-primary border-gray-800 text-gray-500"
      : "bg-white/80 border-gray-100 text-gray-500",

  overlay: "bg-[#101828]/60",

  main: "flex-1 overflow-y-auto py-8 px-5 sm:px-7",

  content: "mx-auto w-full max-w-[72rem] space-y-8",

  success: (dark: boolean) => (dark ? "text-primary-400" : "text-primary-600"),

  successBadge: (dark: boolean) =>
    dark
      ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
      : "bg-primary-50 text-primary-700 border-primary-200",

  highlightCard: (dark: boolean) =>
    dark
      ? "rounded-2xl border border-primary-500/30 bg-dark-secondary text-gray-100"
      : "rounded-2xl border border-primary-200 bg-primary-50/60 text-gray-900",

  historyItem: (dark: boolean, active: boolean) =>
    `rounded-xl border py-3 px-4 text-left text-sm transition-all duration-200 ${
      active
        ? dark
          ? "border-primary-500/50 bg-primary-500/10 ring-1 ring-primary-500/20"
          : "border-primary-300 bg-primary-50 ring-1 ring-primary-100"
        : dark
          ? "border-gray-800 bg-dark-secondary hover:border-gray-700"
          : "border-gray-200 bg-white hover:border-gray-300 shadow-theme-xs"
    }`,
} as const;

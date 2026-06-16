import type { DashboardTab } from "@/presentation/layout/dashboardTabs";

export const PAGE_INTROS: Record<
  DashboardTab,
  { title: string; description: string }
> = {
  SIM: {
    title: "Tariff simulator",
    description:
      "Enter origin, destination, product, and value to estimate duties, VAT, and AfCFTA preferential treatment.",
  },
  IA: {
    title: "HS classification",
    description:
      "Describe your goods in plain language and get a harmonized code proposal with a confidence score.",
  },
  AFT: {
    title: "AfCFTA rules",
    description:
      "Check rules of origin, validate eligibility, project duty reductions, and compare destinations.",
  },
  CSV: {
    title: "Batch processing",
    description:
      "Upload a CSV or Excel file to run simulations for many product lines in one pass.",
  },
  HIST: {
    title: "Simulation history",
    description: "Browse saved runs and export declaration sheets or print certificates.",
  },
  CMR: {
    title: "Cameroon taxation",
    description:
      "Estimate CEMAC customs duties, VAT, excise, port fees, and landed cost for Cameroon imports.",
  },
  CHECKLIST: {
    title: "Import checklist",
    description:
      "Follow the e-GUCE / CAMCIS steps to prepare a Cameroon import from start to finish.",
  },
  PRICING: {
    title: "Plans & billing",
    description:
      "Review usage, change plan, and pay via Mobile Money through PawaPay in supported countries.",
  },
};

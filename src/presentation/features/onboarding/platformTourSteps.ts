import type { DashboardTab } from "@/presentation/layout/dashboardTabs";

export const PLATFORM_TOUR_STORAGE_KEY = "regtech_platform_tour_v1";

export interface PlatformTourStep {
  id: string;
  title: string;
  body: string;
  /** Sidebar button id to spotlight — omit for centered welcome / finish steps. */
  targetId?: string;
  /** Navigate to this tab when the step is shown. */
  tab?: DashboardTab;
  tips?: string[];
}

export const PLATFORM_TOUR_STEPS: PlatformTourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RegTech",
    body: "RegTech helps African traders and customs teams estimate duties, check AfCFTA preferential treatment, and prepare import paperwork — all in one workspace.",
    tips: [
      "This short guide walks through each menu item.",
      "You can reopen it anytime from the header.",
    ],
  },
  {
    id: "simulator",
    title: "Tariff simulator",
    targetId: "tab_simulator",
    tab: "SIM",
    body: "Start here for a single shipment. Enter origin and destination countries, pick a product (HS code), declared value, and optional local content to estimate customs duty, VAT, and total tax.",
    tips: [
      "Results show whether AfCFTA preferential rates apply.",
      "Each run is saved automatically to History.",
    ],
  },
  {
    id: "classifier",
    title: "HS classification",
    targetId: "tab_ai_classifier",
    tab: "IA",
    body: "Not sure of your product code? Describe the goods in plain language and RegTech suggests an HS code with a confidence score. Accept a proposal to send it straight to the simulator.",
    tips: ["Correct the code if needed — your feedback improves future suggestions."],
  },
  {
    id: "afcfta",
    title: "AfCFTA rules",
    targetId: "tab_afcfta_rules",
    tab: "AFT",
    body: "Deep-dive into rules of origin: check eligibility, project progressive duty reductions over time, compare multiple destination countries, and validate local value addition.",
    tips: ["Use the help toggles on each section for regulatory context."],
  },
  {
    id: "batch",
    title: "Batch processing",
    targetId: "tab_batch_csv",
    tab: "CSV",
    body: "Upload a CSV or Excel file to simulate many product lines at once. Download the template and user guide separately, import your file, preview rows, then recalculate the full batch.",
    tips: ["Ideal for catalogs, procurement lists, or customs broker workflows."],
  },
  {
    id: "history",
    title: "History",
    targetId: "tab_history",
    tab: "HIST",
    body: "Every saved simulation appears here. Filter by status, search by product or route, and open any row to view the full pro-forma certificate — export as TXT or print.",
    tips: ["Select multiple rows to export a CSV summary."],
  },
  {
    id: "cameroon",
    title: "Cameroon taxation",
    targetId: "tab_cameroon_fiscal",
    tab: "CMR",
    body: "Estimate landed cost for Cameroon imports: CEMAC customs duties, VAT, excise, port fees, and related fiscal charges using live reference data.",
    tips: ["Complements the AfCFTA simulator with Cameroon-specific fiscal tools."],
  },
  {
    id: "checklist",
    title: "Import checklist",
    targetId: "tab_checklist",
    tab: "CHECKLIST",
    body: "Follow the e-GUCE / CAMCIS import steps from preparation to clearance. Track progress with the stepper and tick off each requirement as you complete it.",
    tips: ["Progress is saved in your browser for this device."],
  },
  {
    id: "pricing",
    title: "Plans & billing",
    targetId: "tab_pricing",
    tab: "PRICING",
    body: "Review your current plan, usage quotas, and upgrade options. Pay via Mobile Money (PawaPay) in supported countries. The plan badge in the header shows your tier at a glance.",
    tips: ["Free tier limits apply — upgrade when you need more simulations or longer history."],
  },
  {
    id: "finish",
    title: "You're ready to go",
    body: "Typical workflow: classify your product → run a simulation → check AfCFTA eligibility → save or print from History. For Cameroon imports, use the fiscal tools and checklist.",
    tips: [
      "Toggle light/dark mode from the header.",
      "Need help on a page? Look for the ? buttons next to titles.",
    ],
  },
];

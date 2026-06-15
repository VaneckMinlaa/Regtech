import type { PawapayCountry, PlanQuotas, PricingPlan } from "./types";

/** Prix de référence en FCFA (feuille de route §7.1). */
export const PLAN_PRICES_XAF: Record<string, number> = {
  free: 0,
  starter: 3_500,
  pro: 19_900,
  business: 99_000,
};

export const PLAN_PRICES_XAF_YEARLY: Record<string, number> = {
  starter: 33_600,
  pro: 191_040,
  business: 950_400,
};

/** Conversion indicative XAF → devise locale (affichage UI). */
export const XAF_TO_LOCAL: Record<string, number> = {
  XAF: 1,
  XOF: 1,
  NGN: 2.58,
  GHS: 0.031,
  KES: 0.22,
  ZAR: 0.031,
};

export const PAWAPAY_COUNTRIES: PawapayCountry[] = [
  { code: "CMR", name: "Cameroun", currency: "XAF", pawapaySupported: true, operators: ["MTN MoMo", "Orange Money"] },
  { code: "NGA", name: "Nigeria", currency: "NGN", pawapaySupported: true, operators: ["MTN MoMo", "Airtel"] },
  { code: "GHA", name: "Ghana", currency: "GHS", pawapaySupported: true, operators: ["MTN", "Vodafone", "AirtelTigo"] },
  { code: "CIV", name: "Côte d'Ivoire", currency: "XOF", pawapaySupported: true, operators: ["MTN", "Orange"] },
  { code: "KEN", name: "Kenya", currency: "KES", pawapaySupported: true, operators: ["M-Pesa"] },
  { code: "ZAF", name: "Afrique du Sud", currency: "ZAR", pawapaySupported: false, operators: [] },
];

const FREE_QUOTAS: PlanQuotas = {
  simulationsPerMonth: 3,
  classificationsPerMonth: 5,
  cameroonFiscalPerMonth: 0,
  historyDays: 0,
  batchRows: 0,
  compareDestinations: 2,
  pdfExport: false,
  checklist: false,
  apiCalls: null,
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Découverte, étudiants",
    priceXafMonthly: 0,
    priceXafYearly: 0,
    quotas: FREE_QUOTAS,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Commerçant occasionnel",
    priceXafMonthly: PLAN_PRICES_XAF.starter,
    priceXafYearly: PLAN_PRICES_XAF_YEARLY.starter,
    quotas: {
      simulationsPerMonth: 50,
      classificationsPerMonth: 30,
      cameroonFiscalPerMonth: 5,
      historyDays: 30,
      batchRows: 20,
      compareDestinations: 3,
      pdfExport: true,
      checklist: true,
      apiCalls: null,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "PME export / import",
    priceXafMonthly: PLAN_PRICES_XAF.pro,
    priceXafYearly: PLAN_PRICES_XAF_YEARLY.pro,
    highlighted: true,
    quotas: {
      simulationsPerMonth: null,
      classificationsPerMonth: null,
      cameroonFiscalPerMonth: null,
      historyDays: null,
      batchRows: 500,
      compareDestinations: 5,
      pdfExport: true,
      checklist: true,
      apiCalls: null,
    },
  },
  {
    id: "business",
    name: "Business",
    description: "Transitaire, API légère",
    priceXafMonthly: PLAN_PRICES_XAF.business,
    priceXafYearly: PLAN_PRICES_XAF_YEARLY.business,
    quotas: {
      simulationsPerMonth: null,
      classificationsPerMonth: null,
      cameroonFiscalPerMonth: null,
      historyDays: null,
      batchRows: null,
      compareDestinations: 10,
      pdfExport: true,
      checklist: true,
      apiCalls: 10_000,
    },
  },
];

export function getPlanById(id: string): PricingPlan {
  return PRICING_PLANS.find((p) => p.id === id) ?? PRICING_PLANS[0];
}

export function formatLocalPrice(priceXaf: number, currency: string): string {
  const factor = XAF_TO_LOCAL[currency] ?? 1;
  const amount = Math.round(priceXaf * factor);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

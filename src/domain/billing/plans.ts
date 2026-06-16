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
  CDF: 4.5,
  USD: 1 / 600,
  ETB: 0.12,
  LSL: 0.031,
  MWK: 0.29,
  MZN: 0.042,
  RWF: 1.76,
  SLE: 0.033,
  TZS: 4.4,
  UGX: 6.1,
  ZMW: 0.043,
  ZAR: 0.031,
};

/** 20 pays PawaPay — checkoutEnabled est mis à jour via GET /billing/countries */
export const PAWAPAY_COUNTRIES: PawapayCountry[] = [
  { code: "CMR", name: "Cameroun", currency: "XAF", pawapaySupported: true, checkoutEnabled: true, operators: ["MTN MoMo", "Orange Money"] },
  { code: "CIV", name: "Côte d'Ivoire", currency: "XOF", pawapaySupported: true, checkoutEnabled: true, operators: ["MTN", "Orange", "Wave"] },
  { code: "SEN", name: "Sénégal", currency: "XOF", pawapaySupported: true, checkoutEnabled: true, operators: ["Free", "Orange", "Wave"] },
  { code: "NGA", name: "Nigeria", currency: "NGN", pawapaySupported: true, checkoutEnabled: true, operators: ["MTN MoMo", "Airtel"] },
  { code: "GHA", name: "Ghana", currency: "GHS", pawapaySupported: true, checkoutEnabled: true, operators: ["MTN", "Vodafone", "AirtelTigo"] },
  { code: "KEN", name: "Kenya", currency: "KES", pawapaySupported: true, checkoutEnabled: true, operators: ["M-Pesa"] },
  { code: "BEN", name: "Bénin", currency: "XOF", pawapaySupported: true, checkoutEnabled: true, operators: ["MTN MoMo", "Moov"] },
  { code: "BFA", name: "Burkina Faso", currency: "XOF", pawapaySupported: true, checkoutEnabled: true, operators: ["Moov", "Orange"] },
  { code: "COD", name: "RD Congo", currency: "CDF", pawapaySupported: true, checkoutEnabled: true, operators: ["Vodacom", "Airtel", "Orange"] },
  { code: "COG", name: "Congo", currency: "XAF", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "MTN MoMo"] },
  { code: "ETH", name: "Éthiopie", currency: "ETB", pawapaySupported: true, checkoutEnabled: true, operators: ["M-Pesa"] },
  { code: "GAB", name: "Gabon", currency: "XAF", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel"] },
  { code: "LSO", name: "Lesotho", currency: "LSL", pawapaySupported: true, checkoutEnabled: true, operators: ["M-Pesa"] },
  { code: "MWI", name: "Malawi", currency: "MWK", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "TNM"] },
  { code: "MOZ", name: "Mozambique", currency: "MZN", pawapaySupported: true, checkoutEnabled: true, operators: ["Movitel", "Vodacom"] },
  { code: "RWA", name: "Rwanda", currency: "RWF", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "MTN MoMo"] },
  { code: "SLE", name: "Sierra Leone", currency: "SLE", pawapaySupported: true, checkoutEnabled: true, operators: ["Orange"] },
  { code: "TZA", name: "Tanzanie", currency: "TZS", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "Vodacom", "Tigo"] },
  { code: "UGA", name: "Ouganda", currency: "UGX", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "MTN MoMo"] },
  { code: "ZMB", name: "Zambie", currency: "ZMW", pawapaySupported: true, checkoutEnabled: true, operators: ["Airtel", "MTN", "Zamtel"] },
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

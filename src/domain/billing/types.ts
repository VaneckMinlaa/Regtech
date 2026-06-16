export type PlanId = "free" | "starter" | "pro" | "business" | "enterprise";

export type SubscriptionStatus = "active" | "past_due" | "cancelled";

export interface PlanQuotas {
  simulationsPerMonth: number | null;
  classificationsPerMonth: number | null;
  cameroonFiscalPerMonth: number | null;
  historyDays: number | null;
  batchRows: number | null;
  compareDestinations: number;
  pdfExport: boolean;
  checklist: boolean;
  apiCalls: number | null;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  priceXafMonthly: number;
  priceXafYearly: number;
  highlighted?: boolean;
  quotas: PlanQuotas;
}

export interface UsageCounters {
  simulations: number;
  classifications: number;
  batchRows: number;
  pdfExports: number;
  yearMonth: string;
}

export interface SubscriptionState {
  plan: PlanId;
  status: SubscriptionStatus;
  provider: "pawapay" | null;
  countryIso: string;
  currency: string;
  periodEnd: string | null;
}

export interface CheckoutRequest {
  plan: Exclude<PlanId, "free" | "enterprise">;
  countryIso: string;
  msisdn?: string;
}

export interface CheckoutResponse {
  depositId: string;
  paymentPageUrl: string;
  amount: number;
  currency: string;
  countryIso: string;
  correspondent?: string;
}

export interface BillingTransactionStatus {
  depositId: string;
  status: string;
  plan: string;
  amount: number;
  currency: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  periodEnd: string | null;
}

export interface PawapayCountry {
  code: string;
  name: string;
  currency: string;
  pawapaySupported: boolean;
  /** Activé sur le compte marchand PawaPay (active-conf) */
  checkoutEnabled?: boolean;
  operators: string[];
}

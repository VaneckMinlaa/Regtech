import type { PlanId, PlanQuotas, PricingPlan, SubscriptionState, UsageCounters } from "@/domain/billing/types";
import { getPlanById } from "@/domain/billing/plans";

export interface BackendPlanQuotas {
  simulationsPerMonth: number | null;
  classificationsPerMonth: number | null;
  cameroonFiscalPerMonth: number | null;
  batchRowsPerMonth: number | null;
  historyRetentionDays: number | null;
  compareDestinations: number;
  certificateDraftsPerMonth: number | null;
  apiCallsPerMonth: number | null;
}

export interface BackendSubscriptionResponse {
  plan: string;
  status: string;
  quotas: BackendPlanQuotas;
  countryIso?: string | null;
  currency?: string | null;
  provider?: string | null;
  periodEnd?: string | null;
}

export interface BackendUsageResponse {
  yearMonth: string;
  simulationsCount: number;
  classificationsCount: number;
  batchRowsCount: number;
  cameroonFiscalCount: number;
  simulationsRemaining: number | null;
}

export function mapBackendQuotas(quotas: BackendPlanQuotas): PlanQuotas {
  return {
    simulationsPerMonth: quotas.simulationsPerMonth,
    classificationsPerMonth: quotas.classificationsPerMonth,
    cameroonFiscalPerMonth: quotas.cameroonFiscalPerMonth,
    historyDays: quotas.historyRetentionDays,
    batchRows: quotas.batchRowsPerMonth,
    compareDestinations: quotas.compareDestinations,
    pdfExport: (quotas.certificateDraftsPerMonth ?? 0) > 0,
    checklist: (quotas.cameroonFiscalPerMonth ?? 0) > 0,
    apiCalls: quotas.apiCallsPerMonth,
  };
}

export function mapBackendSubscription(response: BackendSubscriptionResponse): {
  subscription: SubscriptionState;
  quotas: PlanQuotas;
} {
  const status =
    response.status === "past_due" || response.status === "cancelled"
      ? response.status
      : "active";

  return {
    subscription: {
      plan: response.plan as PlanId,
      status,
      provider: response.provider === "pawapay" ? "pawapay" : null,
      countryIso: response.countryIso ?? "CMR",
      currency: response.currency ?? "XAF",
      periodEnd: response.periodEnd ?? null,
    },
    quotas: mapBackendQuotas(response.quotas),
  };
}

export function mapBackendUsage(response: BackendUsageResponse): UsageCounters {
  return {
    simulations: response.simulationsCount,
    classifications: response.classificationsCount,
    batchRows: response.batchRowsCount,
    pdfExports: 0,
    yearMonth: response.yearMonth,
  };
}

/** Fusionne quotas API avec libellés et prix locaux. */
export function mergeApiPlansWithPricing(apiPlans: BackendSubscriptionResponse[]): PricingPlan[] {
  return apiPlans
    .filter((p) => p.plan !== "enterprise")
    .map((apiPlan) => {
      const local = getPlanById(apiPlan.plan as PlanId);
      return {
        ...local,
        quotas: mapBackendQuotas(apiPlan.quotas),
      };
    });
}

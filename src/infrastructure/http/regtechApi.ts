import type {
  CompareResult,
  Country,
  HealthStatus,
  HSProduct,
  SimulationResult,
} from "@/domain/reference/types";
import { mapCompareResponse } from "@/infrastructure/http/compareMapper";
import type {
  BillingTransactionStatus,
  CheckoutRequest,
  CheckoutResponse,
  PlanQuotas,
  SubscriptionState,
  UsageCounters,
} from "@/domain/billing/types";
import {
  mapBackendCountry,
  type BackendCountryListResponse,
} from "@/infrastructure/http/countriesMapper";
import {
  mapBackendSubscription,
  mapBackendUsage,
  type BackendSubscriptionResponse,
  type BackendUsageResponse,
} from "@/infrastructure/http/monetizationMapper";
import type {
  AfcftaValidateRequest,
  AfcftaValidateResponse,
  AnalyticsSummaryResponse,
  BackendCompareResponse,
  BillingCountriesResponse,
  CompareRequest,
  CameroonFiscalRequest,
  CameroonFiscalResponse,
  CamcisRegimeRequest,
  CamcisRegimeResponse,
  CertificateDraftRequest,
  CertificateDraftResponse,
  LandedCostRequest,
  LandedCostResponse,
  PhoneImportPackRequest,
  PhoneImportPackResponse,
  PortFeesRequest,
  PortFeesResponse,
  ReferenceVersionsResponse,
  ZlecafDutyRequest,
  ZlecafDutyResponse,
  ZlecafProjectionResponse,
} from "@/infrastructure/http/regtechApiTypes";
import { apiGet, apiPost } from "./apiClient";

export interface SimulatePayload {
  origin: string;
  destination: string;
  hsCode: string;
  declaredValueLocal: number;
  quantity: number;
  costMatiereLocale: number;
  mainOeuvreLocale: number;
  fraisLocaux: number;
  prixVenteExport: number;
  year: number;
}

export interface ClassifyPayload {
  description: string;
}

export interface ClassifyResult {
  mode: string;
  hs_code: string;
  confidence: number;
  suggestions: string[];
  reasoning: string;
  category: string;
}

export interface BatchRowInput {
  origin: string;
  destination: string;
  hsCode: string;
  declaredValueLocal: number;
  costMatiereLocale: number;
  mainOeuvreLocale: number;
  fraisLocaux: number;
  prixVenteExport: number;
  year: number;
}

export interface BatchPayload {
  rows: BatchRowInput[];
}

export interface BatchRowResult {
  rowId: number;
  origin: string;
  destination: string;
  hsCode: string;
  productDescription: string;
  year: number;
  declaredValueLocal: number;
  isEligiblePrefAfCFTA: boolean;
  localOriginValueRatio: number;
  baseTariffRate: number;
  appliedTariffRate: number;
  dutyPaidLocal: number;
  vatPaidLocal: number;
  totalTaxLocal: number;
  totalTaxUSD: number;
  currency: string;
  originExchangeRateToUSD: number;
  destinationExchangeRateToUSD: number;
  exchangeRateSource: string;
  hasError: boolean;
}

export interface BatchSummary {
  processedCount: number;
  successCount: number;
  errorCount: number;
  totalTaxUSD: number;
  exchangeRateSource: string;
}

export interface BatchResponse {
  results: BatchRowResult[];
  summary: BatchSummary;
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string | null;
  phone: string | null;
  name: string;
}

export interface MonetizationSnapshot {
  subscription: SubscriptionState;
  quotas: PlanQuotas;
  usage: UsageCounters;
}

/** Client HTTP vers l'API Back `/api/v1` (voir ADR-007, ADR-011). */

const referenceCache = new Map<string, Promise<unknown>>();

function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = referenceCache.get(key);
  if (existing) return existing as Promise<T>;
  const promise = fetcher();
  referenceCache.set(key, promise);
  return promise;
}

export function clearReferenceCache(): void {
  referenceCache.clear();
}

async function fetchMonetizationSnapshot(): Promise<MonetizationSnapshot> {
  const [subscriptionRes, usageRes] = await Promise.all([
    apiGet<BackendSubscriptionResponse>("/api/v1/monetization/subscription", true),
    apiGet<BackendUsageResponse>("/api/v1/monetization/usage", true),
  ]);
  const { subscription, quotas } = mapBackendSubscription(subscriptionRes);
  return {
    subscription,
    quotas,
    usage: mapBackendUsage(usageRes),
  };
}

export const regtechApi = {
  getHealth(): Promise<HealthStatus> {
    return apiGet<HealthStatus>("/api/v1/health", false);
  },

  async getCountries(options?: {
    pilotOnly?: boolean;
    africaOnly?: boolean;
  }): Promise<Country[]> {
    const pilotOnly = options?.pilotOnly ?? false;
    const africaOnly = options?.africaOnly ?? false;
    const params = new URLSearchParams();
    if (pilotOnly) params.set("pilot", "true");
    if (africaOnly) params.set("africa", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    const cacheKey = `countries:${query}`;

    return cachedFetch(cacheKey, async () => {
      const response = await apiGet<BackendCountryListResponse>(
        `/api/v1/countries${query}`,
        false,
      );
      return response.countries.map(mapBackendCountry);
    });
  },

  getTariffs(options?: { catalog?: "afcfta" }): Promise<HSProduct[]> {
    const params = new URLSearchParams();
    if (options?.catalog) params.set("catalog", options.catalog);
    const query = params.toString() ? `?${params.toString()}` : "";
    const cacheKey = `tariffs:${query}`;

    return cachedFetch(cacheKey, () =>
      apiGet<HSProduct[]>(`/api/v1/tariffs${query}`, false, 120_000),
    );
  },

  /** Upsert profil utilisateur côté FastAPI après connexion Clerk. */
  syncProfile(): Promise<UserProfile> {
    return apiGet<UserProfile>("/api/v1/auth/me", true);
  },

  getHistory(): Promise<SimulationResult[]> {
    return apiGet<SimulationResult[]>("/api/v1/history", true);
  },

  simulate(payload: SimulatePayload): Promise<SimulationResult> {
    return apiPost<SimulationResult>("/api/v1/simulate", payload);
  },

  async compare(payload: CompareRequest, countries: Country[]): Promise<CompareResult> {
    const response = await apiPost<BackendCompareResponse>("/api/v1/compare", payload, true);
    return mapCompareResponse(response, countries);
  },

  classify(payload: ClassifyPayload): Promise<ClassifyResult> {
    return apiPost<ClassifyResult>("/api/v1/classify", payload);
  },

  batch(payload: BatchPayload): Promise<BatchResponse> {
    return apiPost<BatchResponse>("/api/v1/batch", payload, true, 120_000);
  },

  async getMonetizationPlans(): Promise<BackendSubscriptionResponse[]> {
    return apiGet<BackendSubscriptionResponse[]>("/api/v1/monetization/plans", false);
  },

  async getSubscription(): Promise<SubscriptionState> {
    const snapshot = await fetchMonetizationSnapshot();
    return snapshot.subscription;
  },

  getMonetizationSnapshot: fetchMonetizationSnapshot,

  async getUsage(): Promise<UsageCounters> {
    const response = await apiGet<BackendUsageResponse>("/api/v1/monetization/usage", true);
    return mapBackendUsage(response);
  },

  startCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse>("/api/v1/billing/checkout", payload, true);
  },

  async getBillingCountries(): Promise<BillingCountriesResponse["countries"]> {
    const response = await apiGet<BillingCountriesResponse>("/api/v1/billing/countries", false);
    return response.countries;
  },

  getBillingTransactionStatus(depositId: string): Promise<BillingTransactionStatus> {
    return apiGet<BillingTransactionStatus>(`/api/v1/billing/transactions/${depositId}`, true);
  },

  computeZlecafDuty(payload: ZlecafDutyRequest): Promise<ZlecafDutyResponse> {
    return apiPost<ZlecafDutyResponse>("/api/v1/afcfta/duty", payload, false);
  },

  getZlecafProjection(params: {
    hsCode: string;
    originCountryIso: string;
    initialDutyRate?: number;
    sensitive?: boolean;
  }): Promise<ZlecafProjectionResponse> {
    const qs = new URLSearchParams({
      hsCode: params.hsCode,
      originCountryIso: params.originCountryIso,
      initialDutyRate: String(params.initialDutyRate ?? 0.2),
      sensitive: String(params.sensitive ?? false),
    });
    return apiGet<ZlecafProjectionResponse>(
      `/api/v1/afcfta/duty/projection?${qs.toString()}`,
      false,
    );
  },

  validateAfcftaOrigin(payload: AfcftaValidateRequest): Promise<AfcftaValidateResponse> {
    return apiPost<AfcftaValidateResponse>("/api/v1/afcfta/validate", payload, true);
  },

  createCertificateDraft(payload: CertificateDraftRequest): Promise<CertificateDraftResponse> {
    return apiPost<CertificateDraftResponse>(
      "/api/v1/afcfta/certificate/draft",
      payload,
      true,
    );
  },

  computeCameroonFiscal(payload: CameroonFiscalRequest): Promise<CameroonFiscalResponse> {
    return apiPost<CameroonFiscalResponse>("/api/v1/cameroon/fiscal", payload, true);
  },

  estimatePortFees(payload: PortFeesRequest): Promise<PortFeesResponse> {
    return apiPost<PortFeesResponse>("/api/v1/cameroon/port-fees", payload, true);
  },

  suggestCamcisRegime(payload: CamcisRegimeRequest): Promise<CamcisRegimeResponse> {
    return apiPost<CamcisRegimeResponse>("/api/v1/cameroon/camcis/regime", payload, true);
  },

  getPhoneImportPack(payload: PhoneImportPackRequest): Promise<PhoneImportPackResponse> {
    return apiPost<PhoneImportPackResponse>("/api/v1/cameroon/pack/phones-2026", payload, true);
  },

  computeLandedCost(payload: LandedCostRequest): Promise<LandedCostResponse> {
    return apiPost<LandedCostResponse>("/api/v1/cameroon/landed-cost", payload, true);
  },

  getMonetizationAnalytics(): Promise<AnalyticsSummaryResponse> {
    return apiGet<AnalyticsSummaryResponse>("/api/v1/monetization/analytics", true);
  },

  getReferenceVersions(): Promise<ReferenceVersionsResponse> {
    return apiGet<ReferenceVersionsResponse>("/api/v1/monetization/reference-versions", false);
  },
};

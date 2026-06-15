import type {
  Country,
  HealthStatus,
  HSProduct,
  SimulationResult,
} from "@/domain/reference/types";
import type {
  CheckoutRequest,
  CheckoutResponse,
  SubscriptionState,
} from "@/domain/billing/types";
import {
  mapBackendCountry,
  type BackendCountryListResponse,
} from "@/infrastructure/http/countriesMapper";
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

  classify(payload: ClassifyPayload): Promise<ClassifyResult> {
    return apiPost<ClassifyResult>("/api/v1/classify", payload);
  },

  batch(payload: BatchPayload): Promise<BatchResponse> {
    return apiPost<BatchResponse>("/api/v1/batch", payload, true, 120_000);
  },

  getPricing(): Promise<{ plans: unknown[] }> {
    return apiGet("/api/v1/pricing", false);
  },

  getSubscription(): Promise<SubscriptionState> {
    return apiGet<SubscriptionState>("/api/v1/billing/subscription", true);
  },

  startCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse>("/api/v1/billing/checkout", payload, true);
  },
};

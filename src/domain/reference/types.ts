export interface Country {
  code: string;
  name: string;
  currency: string;
  vatRate: number;
  exchangeRateToUSD: number;
  flag?: string;
  pilot?: boolean;
}

export interface HSProduct {
  code: string;
  description: string;
  category: string;
  sensitive: boolean;
  baseTariffRate: number;
}

export interface TariffYearProjection {
  year: number;
  reductionPct: number;
  appliedTariffRate: number;
  isEligiblePrefAfCFTA: boolean;
}

export interface SimulationResult {
  id: string;
  date: string;
  origin: string;
  destination: string;
  hsCode: string;
  productDescription: string;
  declaredValueLocal: number;
  declaredValueUSD: number;
  quantity: number;
  isCheckedOrigin: boolean;
  localOriginValueRatio: number;
  year: number;
  isEligiblePrefAfCFTA: boolean;
  baseTariffRate: number;
  appliedTariffRate: number;
  dutyPaidLocal: number;
  vatPaidLocal: number;
  totalTaxLocal: number;
  dutyPaidUSD: number;
  vatPaidUSD: number;
  totalTaxUSD: number;
  sensitiveExclusion: boolean;
  originValueThresholdPct?: number;
  originExchangeRateToUSD?: number;
  destinationExchangeRateToUSD?: number;
  exchangeRateSource?: string;
  tariffProjection?: TariffYearProjection[];
  isCustomCorrected?: boolean;
}

export interface HealthStatus {
  status: string;
  timestamp?: string;
}

export interface CompareDestinationResult {
  countryCode: string;
  countryName: string;
  currency: string;
  totalTaxLocal: number;
  isEligiblePrefAfCFTA: boolean;
}

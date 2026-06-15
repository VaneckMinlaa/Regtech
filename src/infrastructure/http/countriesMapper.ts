import type { Country } from "@/domain/reference/types";

/** Réponse `GET /api/v1/countries` (Back-End CountryItem). */
export interface BackendCountryItem {
  code_iso: string;
  code_alpha2: string;
  name_fr: string;
  name_en: string;
  flag: string | null;
  currency_code: string;
  currency_symbol: string | null;
  region_fr: string | null;
  pilot: boolean;
  vat_rate: number;
  exchange_rate_to_usd: number;
}

export interface BackendCountryListResponse {
  total: number;
  countries: BackendCountryItem[];
}

export function mapBackendCountry(country: BackendCountryItem): Country {
  return {
    code: country.code_iso,
    name: country.name_fr,
    currency: country.currency_code,
    vatRate: country.vat_rate,
    exchangeRateToUSD: country.exchange_rate_to_usd,
    flag: country.flag ?? undefined,
    pilot: country.pilot,
  };
}

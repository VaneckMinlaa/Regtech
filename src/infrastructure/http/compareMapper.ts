import type { CompareResult, Country } from "@/domain/reference/types";
import type { BackendCompareResponse } from "@/infrastructure/http/regtechApiTypes";

function countryLabel(countries: Country[], code: string): string {
  return countries.find((c) => c.code === code)?.name ?? code;
}

/** Mappe la réponse `POST /api/v1/compare` vers le modèle domaine front. */
export function mapCompareResponse(
  response: BackendCompareResponse,
  countries: Country[],
): CompareResult {
  return {
    origin: response.origin,
    hsCode: response.hsCode,
    year: response.year,
    destinationsCount: response.destinationsCount,
    summary: {
      cheapestDestination: response.summary.cheapestDestination,
      mostExpensiveDestination: response.summary.mostExpensiveDestination,
      spreadUSD: response.summary.spreadUSD,
      spreadLocal: response.summary.spreadLocal,
    },
    results: response.results.map((row) => ({
      rank: row.rank,
      countryCode: row.destination,
      countryName: countryLabel(countries, row.destination),
      currency: row.currency,
      totalTaxLocal: row.totalTaxLocal,
      totalTaxUSD: row.totalTaxUSD,
      dutyPaidLocal: row.dutyPaidLocal,
      vatPaidLocal: row.vatPaidLocal,
      isEligiblePrefAfCFTA: row.isEligiblePrefAfCFTA,
      appliedTariffRate: row.appliedTariffRate,
    })),
  };
}

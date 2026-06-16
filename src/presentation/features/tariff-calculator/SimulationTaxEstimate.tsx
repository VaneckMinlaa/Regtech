import type { SimulationResult } from "@/domain/reference/types";
import { CameroonFiscalPreview } from "@/presentation/features/tariff-calculator/CameroonFiscalPreview";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { platform } from "@/presentation/theme/platformStyles";

interface SimulationTaxEstimateProps {
  simulation: SimulationResult;
  darkMode?: boolean;
}

/** Détail de l'estimation fiscale (contenu de la page résultat). */
export function SimulationTaxEstimate({ simulation, darkMode = true }: SimulationTaxEstimateProps) {
  const { countries, products } = useReferenceData();

  const originCountry = countries.find((c) => c.code === simulation.origin);
  const destCountry = countries.find((c) => c.code === simulation.destination);
  const selectedProduct = products.find((p) => p.code === simulation.hsCode);

  return (
    <div className="space-y-6" id="simulation_tax_results">
      <div className="text-center">
        <p className={`text-xs uppercase tracking-wide ${platform.textMuted(darkMode)}`}>
          Total estimated taxes
        </p>
        <div className="mt-2 font-display text-3xl font-bold text-primary-500">
          {simulation.totalTaxLocal.toLocaleString()} {destCountry?.currency ?? ""}
        </div>
        <div className={`text-xs font-mono ${platform.textMuted(darkMode)}`}>
          ≈ {simulation.totalTaxUSD.toLocaleString()} USD
        </div>
      </div>

      {selectedProduct?.sensitive && (
        <p className="text-sm leading-relaxed text-rose-500">
          <strong>Sensitive product (AFT-04).</strong> &quot;{selectedProduct.description}&quot; is excluded
          from preferential treatment. Base duty {(selectedProduct.baseTariffRate * 100).toFixed(0)}% applies.
        </p>
      )}

      {selectedProduct && !selectedProduct.sensitive && simulation.isEligiblePrefAfCFTA && (
        <p className="text-sm leading-relaxed text-primary-500">
          <strong>AfCFTA preference granted.</strong> Concession of{" "}
          {((1 - simulation.appliedTariffRate / simulation.baseTariffRate) * 100).toFixed(0)}% — final rate{" "}
          {(simulation.appliedTariffRate * 100).toFixed(1)}% instead of{" "}
          {(simulation.baseTariffRate * 100).toFixed(1)}%.
        </p>
      )}

      {selectedProduct && !selectedProduct.sensitive && !simulation.isEligiblePrefAfCFTA && (
        <p className="text-sm leading-relaxed text-rose-500">
          <strong>Standard customs regime applied.</strong> Insufficient local value addition (
          {simulation.localOriginValueRatio}% / threshold {simulation.originValueThresholdPct ?? 40}%). Duties
          collected at the full rate.
        </p>
      )}

      <div className="space-y-3 pt-2">
        <div
          className={`flex items-center justify-between border-b py-1 text-sm ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <span className={platform.textMuted(darkMode)}>HS classification code:</span>
          <span className={`font-mono font-semibold ${platform.textPrimary(darkMode)}`}>{simulation.hsCode}</span>
        </div>
        <div
          className={`flex items-center justify-between border-b py-1 text-sm ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <span className={platform.textMuted(darkMode)}>Product description:</span>
          <span
            className={`max-w-[200px] truncate font-semibold ${platform.textSecondary(darkMode)}`}
            title={simulation.productDescription}
          >
            {simulation.productDescription}
          </span>
        </div>
        <div
          className={`flex items-center justify-between border-b py-1 text-sm ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <span className={platform.textMuted(darkMode)}>Base customs duty:</span>
          <span className={`font-mono ${platform.textSecondary(darkMode)}`}>
            {(simulation.baseTariffRate * 100).toFixed(1)}%
          </span>
        </div>
        {simulation.isEligiblePrefAfCFTA && (
          <div
            className={`flex items-center justify-between border-b py-1 text-sm text-primary-600 dark:text-primary-400 ${
              darkMode ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <span>Preferential tariff rate:</span>
            <span className="font-mono font-bold">{(simulation.appliedTariffRate * 100).toFixed(1)}%</span>
          </div>
        )}
        <div
          className={`flex items-center justify-between border-b py-1 text-sm ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <span className={platform.textMuted(darkMode)}>Customs duty amount:</span>
          <span className={`font-mono font-semibold ${platform.textPrimary(darkMode)}`}>
            {simulation.dutyPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
          </span>
        </div>
        <div
          className={`flex items-center justify-between border-b py-1 text-sm ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <span className={platform.textMuted(darkMode)}>
            Destination VAT ({Math.round((destCountry?.vatRate ?? 0) * 100)}%):
          </span>
          <span className={`font-mono font-semibold ${platform.textPrimary(darkMode)}`}>
            {simulation.vatPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        {originCountry && destCountry && (
          <>
            <span className={platform.textMuted(darkMode)}>
              Origin: 1 USD = {simulation.originExchangeRateToUSD ?? originCountry.exchangeRateToUSD}{" "}
              {originCountry.currency}
            </span>
            <span className={platform.textMuted(darkMode)}>
              Destination: 1 USD = {simulation.destinationExchangeRateToUSD ?? destCountry.exchangeRateToUSD}{" "}
              {destCountry.currency}
            </span>
            <span className={`text-[11px] ${platform.textMuted(darkMode)}`}>
              Rate source:{" "}
              {simulation.exchangeRateSource === "frankfurter"
                ? "Frankfurter (ECB)"
                : simulation.exchangeRateSource === "pilot"
                  ? "AfCFTA pilot reference"
                  : "Country reference"}
            </span>
          </>
        )}
      </div>

      {simulation.destination === "CMR" && (
        <CameroonFiscalPreview
          cifValue={simulation.declaredValueLocal}
          hsCode={simulation.hsCode}
          originCountryIso={simulation.origin}
          year={simulation.year}
          applyZlecaf={simulation.isEligiblePrefAfCFTA}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

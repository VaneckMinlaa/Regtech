/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { convertBetweenCurrencies } from "@/domain/reference/currencyUtils";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { CameroonFiscalPreview } from "@/presentation/features/tariff-calculator/CameroonFiscalPreview";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { ApiError } from "@/infrastructure/http/apiClient";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { platform } from "@/presentation/theme/platformStyles";

interface SimulateurTaxesProps {
  onSimulationRun: (result: SimulationResult) => void;
  initialHSCode?: string;
  initialProductDesc?: string;
  darkMode?: boolean;
  onUpgrade?: () => void;
}

export const SimulateurTaxes: React.FC<SimulateurTaxesProps> = ({ 
  onSimulationRun, 
  initialHSCode = "",
  initialProductDesc = "",
  darkMode = true,
  onUpgrade,
}) => {
  const { countries, products, isLoading: refLoading, productsLoading } = useReferenceData();
  const { canUse, recordUsage } = useSubscription();

  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [hsCode, setHSCode] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [year] = useState<number>(2026);

  const [costMatiereLocale, setCostMatiereLocale] = useState<number>(0);
  const [mainOeuvreLocale, setMainOeuvreLocale] = useState<number>(0);
  const [fraisLocaux, setFraisLocaux] = useState<number>(0);
  const [prixVenteExport, setPrixVenteExport] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (initialized || countries.length === 0) return;

    const pilots = countries.filter((c) => c.pilot);
    const defaultOrigin = pilots[0]?.code ?? countries[0].code;
    const defaultDestination =
      pilots.find((c) => c.code !== defaultOrigin)?.code ??
      countries.find((c) => c.code !== defaultOrigin)?.code ??
      defaultOrigin;

    setOrigin(defaultOrigin);
    setDestination(defaultDestination);
    if (products.length > 0) {
      setHSCode(products[0].code);
    }
    setInitialized(true);
  }, [countries, products, initialized]);

  useEffect(() => {
    if (initialHSCode) setHSCode(initialHSCode);
  }, [initialHSCode]);

  const originCountry = countries.find((c) => c.code === origin);
  const destCountry = countries.find((c) => c.code === destination);
  const selectedProduct = products.find((p) => p.code === hsCode);

  const originFx =
    currentResult?.originExchangeRateToUSD ?? originCountry?.exchangeRateToUSD ?? 0;
  const destFx =
    currentResult?.destinationExchangeRateToUSD ?? destCountry?.exchangeRateToUSD ?? 0;

  const declaredValueInDest =
    originCountry && destCountry && declaredValue > 0
      ? convertBetweenCurrencies(declaredValue, originFx, destFx)
      : 0;
  const declaredValueUsd =
    currentResult?.declaredValueUSD ??
    (originFx > 0 && declaredValue > 0 ? declaredValue / originFx : 0);

  // Quick calculate helpers in under 100ms
  const handleSimulate = async () => {
    if (!canUse("simulations")) {
      setErrorMsg("Simulation quota reached for this month. Upgrade to a higher plan.");
      onUpgrade?.();
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await regtechApi.simulate({
        origin,
        destination,
        hsCode,
        declaredValueLocal: declaredValue,
        quantity,
        costMatiereLocale,
        mainOeuvreLocale,
        fraisLocaux,
        prixVenteExport: prixVenteExport || declaredValue,
        year,
      });
      setCurrentResult(data);
      recordUsage("simulations");
      onSimulationRun(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setErrorMsg("Quota reached — choose a plan on the Offers tab.");
        onUpgrade?.();
      } else {
        setErrorMsg(
          err instanceof ApiError
            ? err.message
            : "Unable to reach the simulation service.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    !refLoading &&
    countries.length > 0 &&
    (products.length > 0 || !productsLoading) &&
    origin &&
    destination &&
    origin !== destination &&
    hsCode &&
    declaredValue > 0 &&
    prixVenteExport > 0;

  const originThreshold = currentResult?.originValueThresholdPct ?? 40;
  const originValueRatio = prixVenteExport > 0 
    ? ((costMatiereLocale + mainOeuvreLocale + fraisLocaux) / prixVenteExport) * 100 
    : 0;

  if (refLoading) {
    return (
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Loading countries from the API...
      </p>
    );
  }

  const fieldClass = platform.input(darkMode);
  const sectionClass = `space-y-4 pb-10 border-b ${platform.borderSubtle(darkMode)} last:border-0 last:pb-0`;

  return (
    <div className="flex flex-col gap-10 font-sans" id="simulator_workspace">
      <section className={sectionClass}>
        <div className="flex flex-col gap-4">
            <div>
              <label className={platform.fieldLabel(darkMode)}>Country of origin</label>
              <SearchableSelect
                id="select_origin_country"
                value={origin}
                darkMode={darkMode}
                loading={refLoading}
                options={countryToOptions(countries)}
                placeholder="Type to filter an origin country…"
                noDataPlaceholder="Countries unavailable (start the API)"
                onChange={(code) => {
                  setOrigin(code);
                  if (code === destination) {
                    setDestination(countries.find((c) => c.code !== code)?.code ?? "");
                  }
                }}
              />
            </div>

            <div>
              <label className={platform.fieldLabel(darkMode)}>Destination country</label>
              <SearchableSelect
                id="select_destination_country"
                value={destination}
                darkMode={darkMode}
                loading={refLoading}
                options={countryToOptions(countries)}
                placeholder="Type to filter a destination country…"
                noDataPlaceholder="Countries unavailable (start the API)"
                onChange={(code) => {
                  setDestination(code);
                  if (code === origin) {
                    setOrigin(countries.find((c) => c.code !== code)?.code ?? "");
                  }
                }}
              />
            </div>

            <div>
              <label className={`${platform.fieldLabel(darkMode)} flex items-center justify-between gap-2`}>
                <span>Product (HS code directory)</span>
                {products.length > 0 && (
                  <span className="text-[10px] font-normal opacity-70">
                    {products.length} codes HS
                  </span>
                )}
                {initialHSCode && (
                  <span className="text-[10px] text-primary-600 bg-primary-500/10 px-2 py-0.5 border border-primary-500/20 rounded-full font-bold">
                    Assigned by AI classification: {initialHSCode}
                  </span>
                )}
              </label>
              <SearchableSelect
                id="select_tariff_product"
                value={hsCode}
                darkMode={darkMode}
                loading={refLoading}
                options={productToOptions(products)}
                placeholder="Type HS code or description…"
                noDataPlaceholder="Products unavailable (start the API)"
                onChange={setHSCode}
              />
            </div>

            <div>
              <label className={platform.fieldLabel(darkMode)}>
                Declared value ({originCountry?.currency ?? "—"})
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="input_declared_value"
                  min="1"
                  value={declaredValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDeclaredValue(val);
                    setPrixVenteExport(val);
                  }}
                  className={`${fieldClass} pr-12`}
                  placeholder="Ex: 5,000,000"
                />
                <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  {originCountry?.currency ?? ""}
                </span>
              </div>
              {originCountry && destCountry && declaredValue > 0 && (
                <p className={`mt-1.5 text-[10px] font-mono ${
                  darkMode ? "text-gray-500" : "text-gray-500"
                }`}>
                  ≈ {declaredValueInDest.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                  {destCountry.currency} at destination
                  {declaredValueUsd > 0 && (
                    <> · {declaredValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</>
                  )}
                  {!currentResult && (
                    <span className="opacity-70"> (exchange rate)</span>
                  )}
                </p>
              )}
            </div>

            <div>
              <label className={platform.fieldLabel(darkMode)}>Quantity</label>
              <input
                type="number"
                id="input_quantity_articles"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={fieldClass}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="mt-4 text-xs text-rose-500 font-medium">{errorMsg}</p>
          )}

          <button
            type="button"
            id="btn_run_simulation"
            disabled={!canSubmit || isLoading}
            onClick={() => void handleSimulate()}
            className={`mt-6 w-full ${platform.buttonGradient}`}
          >
            Calculate duties and taxes
          </button>
      </section>

      <section className={sectionClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>Rule of origin (AFT)</p>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${originValueRatio >= originThreshold ? "border-primary-500/20 bg-primary-500/10 text-primary-600" : "border-rose-500/20 bg-rose-500/10 text-rose-600"}`}>
              {originValueRatio >= originThreshold
                ? `Eligible (≥${originThreshold}%)`
                : `Non-compliant (<${originThreshold}%)`}
            </span>
          </div>

          <div className={`mb-4 rounded-2xl px-4 py-3 text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>
            <span className={`mb-2 block text-xs font-semibold uppercase tracking-wide ${platform.textMuted(darkMode)}`}>
              AfCFTA origin formula
            </span>
            <p className={`text-center font-display font-semibold ${platform.textPrimary(darkMode)}`}>
              R = (Local materials + Local labor + Local fees) / Export sale price × 100
            </p>
            <p className={`mt-2 text-center text-xs ${platform.textMuted(darkMode)}`}>
              ({costMatiereLocale.toLocaleString()} + {mainOeuvreLocale.toLocaleString()} + {fraisLocaux.toLocaleString()}) / {prixVenteExport.toLocaleString()} × 100 ={" "}
              <span className="font-semibold text-primary-500">{originValueRatio.toFixed(1)}%</span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className={platform.fieldLabel(darkMode)}>
                Local material costs ({originCountry?.currency ?? "—"})
              </label>
              <input type="number" value={costMatiereLocale} onChange={(e) => setCostMatiereLocale(Number(e.target.value))} className={fieldClass} />
            </div>
            <div>
              <label className={platform.fieldLabel(darkMode)}>
                Local labor costs ({originCountry?.currency ?? "—"})
              </label>
              <input type="number" value={mainOeuvreLocale} onChange={(e) => setMainOeuvreLocale(Number(e.target.value))} className={fieldClass} />
            </div>
            <div>
              <label className={platform.fieldLabel(darkMode)}>
                Local logistics fees ({originCountry?.currency ?? "—"})
              </label>
              <input type="number" value={fraisLocaux} onChange={(e) => setFraisLocaux(Number(e.target.value))} className={fieldClass} />
            </div>
            <div>
              <label className={platform.fieldLabel(darkMode)}>
                Export sale price ({originCountry?.currency ?? "—"})
              </label>
              <input type="number" value={prixVenteExport} onChange={(e) => setPrixVenteExport(Number(e.target.value))} className={fieldClass} />
            </div>
          </div>
      </section>

      <section className="space-y-6">
          <div className={`flex items-center justify-between border-b pb-4 ${platform.borderSubtle(darkMode)}`}>
            <p className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>Tax estimate</p>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-primary-500" />}
          </div>

          {currentResult ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Main Total Callout */}
              <div className="text-center">
                <p className={`text-xs uppercase tracking-wide ${platform.textMuted(darkMode)}`}>
                  Total estimated taxes
                </p>
                <div className="mt-2 text-3xl font-bold text-primary-500 font-display">
                  {currentResult.totalTaxLocal.toLocaleString()} {destCountry?.currency ?? ""}
                </div>
                <div className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  ≈ {currentResult.totalTaxUSD.toLocaleString()} USD
                </div>
              </div>

              {selectedProduct?.sensitive && (
                <p className={`text-sm leading-relaxed text-rose-500`}>
                  <strong>Sensitive product (AFT-04).</strong> &quot;{selectedProduct.description}&quot; is excluded from preferential treatment. Base duty {(selectedProduct.baseTariffRate * 100).toFixed(0)}% applies.
                </p>
              )}

              {selectedProduct && !selectedProduct.sensitive && currentResult.isEligiblePrefAfCFTA && (
                <p className="text-sm leading-relaxed text-primary-500">
                  <strong>AfCFTA preference granted.</strong> Concession of {((1 - currentResult.appliedTariffRate / currentResult.baseTariffRate) * 100).toFixed(0)}% — final rate {(currentResult.appliedTariffRate * 100).toFixed(1)}% instead of {(currentResult.baseTariffRate * 100).toFixed(1)}%.
                </p>
              )}

              {selectedProduct && !selectedProduct.sensitive && !currentResult.isEligiblePrefAfCFTA && (
                <p className="text-sm leading-relaxed text-rose-500">
                  <strong>Standard customs regime applied.</strong>{" "}
                  Insufficient local value addition ({currentResult.localOriginValueRatio}% / threshold{" "}
                  {currentResult.originValueThresholdPct ?? 40}%). Duties collected at the full rate.
                </p>
              )}

              {/* Detailed items line */}
              <div className="space-y-3 pt-2">
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>HS classification code:</span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{currentResult.hsCode}</span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Product description:</span>
                  <span className={`font-semibold truncate max-w-[200px] ${darkMode ? "text-gray-300" : "text-gray-800"}`} title={currentResult.productDescription}>
                    {currentResult.productDescription}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Base customs duty:</span>
                  <span className={`font-mono ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{(currentResult.baseTariffRate * 100).toFixed(1)}%</span>
                </div>
                {currentResult.isEligiblePrefAfCFTA && (
                  <div className={`flex items-center justify-between text-xs py-1 border-b text-primary-600 dark:text-primary-400 ${
                    darkMode ? "border-gray-800" : "border-gray-100"
                  }`}>
                    <span>Preferential tariff rate:</span>
                    <span className="font-mono font-bold">{(currentResult.appliedTariffRate * 100).toFixed(1)}%</span>
                  </div>
                )}
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Customs duty amount:</span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {currentResult.dutyPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    Destination VAT ({Math.round((destCountry?.vatRate ?? 0) * 100)}%):
                  </span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {currentResult.vatPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
                  </span>
                </div>
              </div>

              {/* Taux de change utilisés par la simulation (Frankfurter / API backend) */}
              <div className="flex flex-col gap-1 text-xs">
                {originCountry && destCountry && currentResult && (
                  <>
                    <span className={platform.textMuted(darkMode)}>
                      Origin: 1 USD = {currentResult.originExchangeRateToUSD ?? originCountry.exchangeRateToUSD}{" "}
                      {originCountry.currency}
                    </span>
                    <span className={platform.textMuted(darkMode)}>
                      Destination: 1 USD = {currentResult.destinationExchangeRateToUSD ?? destCountry.exchangeRateToUSD}{" "}
                      {destCountry.currency}
                    </span>
                    <span className={`text-[11px] ${platform.textMuted(darkMode)}`}>
                      Rate source:{" "}
                      {currentResult.exchangeRateSource === "frankfurter"
                        ? "Frankfurter (ECB)"
                        : currentResult.exchangeRateSource === "pilot"
                          ? "AfCFTA pilot reference"
                          : "Country reference"}
                    </span>
                  </>
                )}
              </div>
              {destination === "CMR" && currentResult && (
                <CameroonFiscalPreview
                  cifValue={declaredValue}
                  hsCode={currentResult.hsCode}
                  originCountryIso={origin}
                  year={year}
                  applyZlecaf={currentResult.isEligiblePrefAfCFTA}
                  darkMode={darkMode}
                />
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center py-12 text-sm ${platform.textMuted(darkMode)}`}>
              Run a simulation to see your tax estimate.
            </div>
          )}
      </section>
    </div>
  );
};

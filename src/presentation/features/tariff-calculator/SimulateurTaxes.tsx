/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Scale, ShieldAlert, BadgeCheck, Calculator, RefreshCw } from "lucide-react";
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
  const [year, setYear] = useState<number>(2026);

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
      setErrorMsg("Quota de simulations atteint pour ce mois. Passez à un plan supérieur.");
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
        setErrorMsg("Quota atteint — choisissez un plan sur l'onglet Offres.");
        onUpgrade?.();
      } else {
        setErrorMsg(
          err instanceof ApiError
            ? err.message
            : "Impossible de joindre le service de simulation.",
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
        Chargement des pays depuis l&apos;API...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans" id="simulator_workspace">
      {/* Simulation Inputs Box */}
      <div className="lg:col-span-7 space-y-6">
        <div className={`border rounded-lg p-6 transition-colors duration-300 ${
          darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-primary-500" />
            <h2 className={`text-base font-bold font-display ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>Simulateur de droits de douane</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Pays de provenance
              </label>
              <SearchableSelect
                id="select_origin_country"
                value={origin}
                darkMode={darkMode}
                loading={refLoading}
                options={countryToOptions(countries)}
                placeholder="Tapez pour filtrer un pays d'origine…"
                noDataPlaceholder="Pays indisponibles (demarrer l'API)"
                onChange={(code) => {
                  setOrigin(code);
                  if (code === destination) {
                    setDestination(countries.find((c) => c.code !== code)?.code ?? "");
                  }
                }}
              />
            </div>

            {/* Destination */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Pays de destination
              </label>
              <SearchableSelect
                id="select_destination_country"
                value={destination}
                darkMode={darkMode}
                loading={refLoading}
                options={countryToOptions(countries)}
                placeholder="Tapez pour filtrer un pays de destination…"
                noDataPlaceholder="Pays indisponibles (demarrer l'API)"
                onChange={(code) => {
                  setDestination(code);
                  if (code === origin) {
                    setOrigin(countries.find((c) => c.code !== code)?.code ?? "");
                  }
                }}
              />
            </div>

            {/* Product HS-Code Selection */}
            <div className="md:col-span-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 flex justify-between items-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <span>Sélection du Produit (HS Code Répertoire)</span>
                {products.length > 0 && (
                  <span className="text-[10px] font-normal opacity-70">
                    {products.length} codes HS
                  </span>
                )}
                {initialHSCode && (
                  <span className="text-[10px] text-primary-600 bg-primary-500/10 px-2 py-0.5 border border-primary-500/20 rounded-full font-bold">
                    Assigné par classification IA: {initialHSCode}
                  </span>
                )}
              </label>
              <SearchableSelect
                id="select_tariff_product"
                value={hsCode}
                darkMode={darkMode}
                loading={refLoading}
                options={productToOptions(products)}
                placeholder="Tapez code HS ou description…"
                noDataPlaceholder="Produits indisponibles (demarrer l'API)"
                onChange={setHSCode}
              />
            </div>

            {/* Declared local Value */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Valeur declaree ({originCountry?.currency ?? "—"})
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
                  className={`w-full rounded-lg pl-3.5 pr-12 py-2.5 text-sm font-mono focus:outline-none focus:border-primary-500 transition-colors ${
                    darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"
                  }`}
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
                  {destCountry.currency} à destination
                  {declaredValueUsd > 0 && (
                    <> · {declaredValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</>
                  )}
                  {!currentResult && (
                    <span className="opacity-70"> (taux de change)</span>
                  )}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Quantité d'articles
              </label>
              <input
                type="number"
                id="input_quantity_articles"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-primary-500 transition-colors ${
                  darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Year Slider Picker */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Année Calendaire de l'Accord AfCFTA
                </label>
                <span className={`text-xs font-extrabold font-mono ${
                  darkMode ? "text-primary-400" : "text-primary-700"
                }`}>
                  {year === 2025 ? "2025 (Hors Traité)" : `${year} (${year === 2030 ? "Exemption totale" : `Réduction -${(0.75 + (year - 2026) * 0.05) * 100}%`})`}
                </span>
              </div>
              <input
                type="range"
                id="input_year_slider"
                min="2025"
                max="2030"
                step="1"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full accent-primary-500 rounded h-1.5 bg-gray-200 dark:bg-[#101828] cursor-pointer"
              />
              <div className={`flex justify-between text-[10px] font-mono mt-1 px-1 ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}>
                <span>2025</span>
                <span>2026</span>
                <span>2027</span>
                <span>2028</span>
                <span>2029</span>
                <span>2030 (Libre)</span>
              </div>
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
            className="mt-4 w-full bg-primary-500 hover:bg-primary-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2"
          >
            Calculer les droits et taxes
          </button>
        </div>

        {/* Rule of Origin Subsection */}
        <div className={`border rounded-lg p-6 transition-all duration-300 ${
          darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-500" />
              <h3 className={`text-sm font-bold font-display ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}>Calcul d'Éligibilité Règle d'Origine (AFT)</h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 font-bold rounded-full border ${originValueRatio >= originThreshold ? "bg-primary-500/10 text-primary-600 border-primary-500/20" : "bg-rose-500/10 text-rose-600 border-rose-550/20"}`}>
              {originValueRatio >= originThreshold ? `Éligible (≥${originThreshold}%)` : `Non-Conforme (<${originThreshold}%)`}
            </span>
          </div>

          <div className={`p-3 rounded-lg text-xs leading-5 font-mono border mb-4 ${
            darkMode ? "bg-[#101828] border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
          }`}>
            <span className={`font-bold block mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Formule mathématique officielle (ZLECAf) :</span>
            <div className={`text-center font-bold text-xs my-2 tracking-wide font-display ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              R_origine = (Coût Mat. Locales + Main d'Œuvre Loc. + Frais Locaux) / Prix de Vente Export × 100
            </div>
            <div className="text-center text-[10px] text-gray-500 mt-1">
              ({costMatiereLocale.toLocaleString()} + {mainOeuvreLocale.toLocaleString()} + {fraisLocaux.toLocaleString()}) / {prixVenteExport.toLocaleString()} &times; 100 = <span className="text-primary-600 font-bold text-xs">{originValueRatio.toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wide block mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Cout matieres locales ({originCountry?.currency ?? "—"})
              </label>
              <input
                type="number"
                value={costMatiereLocale}
                onChange={(e) => setCostMatiereLocale(Number(e.target.value))}
                className={`w-full rounded px-3 py-1.5 text-xs font-mono ${
                  darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-primary-500"
                }`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wide block mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Main d&apos;oeuvre locale ({originCountry?.currency ?? "—"})
              </label>
              <input
                type="number"
                value={mainOeuvreLocale}
                onChange={(e) => setMainOeuvreLocale(Number(e.target.value))}
                className={`w-full rounded px-3 py-1.5 text-xs font-mono ${
                  darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-primary-500"
                }`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wide block mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Frais logistiques locaux ({originCountry?.currency ?? "—"})
              </label>
              <input
                type="number"
                value={fraisLocaux}
                onChange={(e) => setFraisLocaux(Number(e.target.value))}
                className={`w-full rounded px-3 py-1.5 text-xs font-mono ${
                  darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-primary-500"
                }`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wide block mb-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Prix de vente export ({originCountry?.currency ?? "—"})
              </label>
              <input
                type="number"
                value={prixVenteExport}
                onChange={(e) => setPrixVenteExport(Number(e.target.value))}
                className={`w-full rounded px-3 py-1.5 text-xs font-mono ${
                  darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-primary-500"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Results Output panel */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className={`border rounded-lg p-6 h-full flex flex-col transition-all duration-300 ${
          darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
        }`}>
          <div className={`flex items-center justify-between pb-4 mb-6 shrink-0 border-b ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}>
            <div>
              <h3 className={`text-sm font-bold font-display ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}>Calcul des taxes simulées</h3>
              <p className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rendu instantané à base d'abattements réels</p>
            </div>
            {isLoading && <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />}
          </div>

          {currentResult ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Main Total Callout */}
              <div className={`p-5 rounded-xl border text-center ${
                darkMode ? "bg-[#101828]/60 border-gray-800" : "bg-gray-50 border-gray-200 shadow-inner"
              }`}>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  darkMode ? "bg-dark-secondary text-gray-400" : "bg-gray-200 text-gray-600"
                }`}>
                  Total Taxes Évaluées
                </span>
                <div className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono mt-2 mb-1">
                  {currentResult.totalTaxLocal.toLocaleString()} {destCountry?.currency ?? ""}
                </div>
                <div className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  ≈ {currentResult.totalTaxUSD.toLocaleString()} USD
                </div>
              </div>

              {/* Exclusion banner if sensitive product */}
              {selectedProduct?.sensitive && (
                <div className={`border px-3.5 py-3 rounded-lg text-xs flex items-start gap-2 ${
                  darkMode ? "bg-rose-950/20 border-rose-500/20 text-rose-300" : "bg-rose-50 border-rose-150 text-rose-900"
                }`}>
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Exclusion/Sensibilité (AFT-04) :</strong>
                    <p className={`text-[11px] mt-0.5 ${darkMode ? "text-rose-400/95" : "text-rose-700/95"}`}>
                      &quot;{selectedProduct?.description}&quot; est liste comme produit sensible. Les droits de douane de base ({Math.round((selectedProduct?.baseTariffRate ?? 0) * 100)}%) s&apos;appliquent sans abattement.
                    </p>
                  </div>
                </div>
              )}

              {/* Preference success badge */}
              {selectedProduct && !selectedProduct.sensitive && currentResult.isEligiblePrefAfCFTA && (
                <div className={`border px-3.5 py-3 rounded-lg text-xs flex items-start gap-2 ${
                  darkMode ? "bg-primary-950/20 border-primary-500/20 text-primary-300" : "bg-primary-50 border-primary-200 text-primary-900"
                }`}>
                  <BadgeCheck className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Préférence Accordée ZLECAf :</strong>
                    <p className={`text-[11px] mt-0.5 ${darkMode ? "text-primary-400/95" : "text-primary-800"}`}>
                      Traitement préférentiel certifié d'abattement de {((1 - currentResult.appliedTariffRate/currentResult.baseTariffRate)*100).toFixed(0)}%. Taux final : <span className="underline font-bold">{(currentResult.appliedTariffRate * 100).toFixed(1)}%</span> au lieu de {(currentResult.baseTariffRate * 100).toFixed(1)}%.
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed items line */}
              <div className="space-y-3 pt-2">
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Classification Code HS:</span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{currentResult.hsCode}</span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Désignation Produit:</span>
                  <span className={`font-semibold truncate max-w-[200px] ${darkMode ? "text-gray-300" : "text-gray-800"}`} title={currentResult.productDescription}>
                    {currentResult.productDescription}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Droit de Douane de base:</span>
                  <span className={`font-mono ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{(currentResult.baseTariffRate * 100).toFixed(1)}%</span>
                </div>
                {currentResult.isEligiblePrefAfCFTA && (
                  <div className={`flex items-center justify-between text-xs py-1 border-b text-primary-600 dark:text-primary-400 ${
                    darkMode ? "border-gray-800" : "border-gray-100"
                  }`}>
                    <span>Taux Tarifaire Préférentiel:</span>
                    <span className="font-mono font-bold">{(currentResult.appliedTariffRate * 100).toFixed(1)}%</span>
                  </div>
                )}
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Montant d'impôt douanier:</span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {currentResult.dutyPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs py-1 border-b ${
                  darkMode ? "border-gray-800" : "border-gray-100"
                }`}>
                  <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    TVA locale de destination ({Math.round((destCountry?.vatRate ?? 0) * 100)}%) :
                  </span>
                  <span className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {currentResult.vatPaidLocal.toLocaleString()} {destCountry?.currency ?? ""}
                  </span>
                </div>
              </div>

              {/* Taux de change utilisés par la simulation (Frankfurter / API backend) */}
              <div className={`text-[10px] font-mono flex flex-col gap-1 px-3 py-2 rounded ${
                darkMode ? "text-gray-500 bg-[#101828]" : "text-gray-600 bg-gray-100"
              }`}>
                {originCountry && destCountry && currentResult && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>
                        Prov: 1 USD = {currentResult.originExchangeRateToUSD ?? originCountry.exchangeRateToUSD}{" "}
                        {originCountry.currency}
                      </span>
                      <span>
                        Dest: 1 USD = {currentResult.destinationExchangeRateToUSD ?? destCountry.exchangeRateToUSD}{" "}
                        {destCountry.currency}
                      </span>
                    </div>
                    <span className={`text-[9px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Source taux: {currentResult.exchangeRateSource === "frankfurter"
                        ? "Frankfurter (BCE, gratuit)"
                        : currentResult.exchangeRateSource === "pilot"
                          ? "Référentiel pilote AfCFTA"
                          : "Référentiel pays"}
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
            <div className={`flex-1 flex items-center justify-center text-xs ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              Prêt à calculer les taxes...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

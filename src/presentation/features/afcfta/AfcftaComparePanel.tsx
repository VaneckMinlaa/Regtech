import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Loader2, TrendingUp } from "lucide-react";
import type { CompareResult, Country, HSProduct } from "@/domain/reference/types";
import { ApiError } from "@/infrastructure/http/apiClient";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";

export interface OriginEconomics {
  costMatiereLocale: number;
  mainOeuvreLocale: number;
  fraisLocaux: number;
  prixVenteExport: number;
}

interface AfcftaComparePanelProps {
  countries: Country[];
  products: HSProduct[];
  refLoading?: boolean;
  darkMode?: boolean;
  /** Valeurs partagées avec la projection / validation sur la même page. */
  origin?: string;
  hsCode?: string;
  declaredValue?: number;
  onOriginChange?: (value: string) => void;
  onHsCodeChange?: (value: string) => void;
  onDeclaredValueChange?: (value: number) => void;
  originEconomics?: OriginEconomics;
  onUpgrade?: () => void;
}

const DEFAULT_DECLARED = 10_000_000;

function defaultEconomics(declaredValue: number): OriginEconomics {
  return {
    costMatiereLocale: Math.round(declaredValue * 0.4),
    mainOeuvreLocale: Math.round(declaredValue * 0.15),
    fraisLocaux: Math.round(declaredValue * 0.1),
    prixVenteExport: declaredValue,
  };
}

function parseCompareError(err: unknown): { message: string; status?: number } {
  if (err instanceof ApiError) {
    return { message: err.message, status: err.status };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Unable to compare destinations." };
}

/** Comparaison multi-destinations via `POST /api/v1/compare`. */
export function AfcftaComparePanel({
  countries,
  products,
  refLoading = false,
  darkMode = true,
  origin: originProp,
  hsCode: hsCodeProp,
  declaredValue: declaredValueProp,
  onOriginChange,
  onHsCodeChange,
  onDeclaredValueChange,
  originEconomics,
  onUpgrade,
}: AfcftaComparePanelProps) {
  const { quotas, recordUsage } = useSubscription();
  const maxDestinations = quotas.compareDestinations;

  const [compOrigin, setCompOrigin] = useState("");
  const [compProduct, setCompProduct] = useState("");
  const [compVal, setCompVal] = useState(DEFAULT_DECLARED);
  const [destinations, setDestinations] = useState<string[]>(["", "", ""]);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm font-mono border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-0 ${
    darkMode
      ? "bg-dark-secondary border-gray-800 text-gray-100 hover:border-gray-700"
      : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
  }`;

  const panelClass = darkMode
    ? "bg-dark-primary border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-800 shadow-sm";

  useEffect(() => {
    if (countries.length === 0) return;
    setCompOrigin((prev) => originProp || prev || countries[0].code);
    setDestinations((prev) => {
      const next = [...prev];
      if (!next[0]) next[0] = countries[0]?.code ?? "";
      if (!next[1] && countries[1]) next[1] = countries[1].code;
      if (!next[2] && countries[2]) next[2] = countries[2].code;
      return next;
    });
  }, [countries, originProp]);

  useEffect(() => {
    if (originProp) setCompOrigin(originProp);
  }, [originProp]);

  useEffect(() => {
    if (hsCodeProp) setCompProduct(hsCodeProp);
    else if (products.length > 0) {
      setCompProduct((prev) => prev || products[0].code);
    }
  }, [products, hsCodeProp]);

  useEffect(() => {
    if (declaredValueProp !== undefined && declaredValueProp > 0) {
      setCompVal(declaredValueProp);
    }
  }, [declaredValueProp]);

  const setOrigin = (value: string) => {
    setCompOrigin(value);
    onOriginChange?.(value);
  };

  const setProduct = (value: string) => {
    setCompProduct(value);
    onHsCodeChange?.(value);
  };

  const setDeclaredValue = (value: number) => {
    setCompVal(value);
    onDeclaredValueChange?.(value);
  };

  const activeDestinations = useMemo(() => {
    const unique = destinations
      .slice(0, maxDestinations)
      .map((d) => d.trim().toUpperCase())
      .filter(Boolean);
    return [...new Set(unique)];
  }, [destinations, maxDestinations]);

  const economics = useMemo(
    () => originEconomics ?? defaultEconomics(compVal),
    [originEconomics, compVal],
  );

  const canCompare =
    Boolean(compOrigin && compProduct && compVal > 0 && activeDestinations.length > 0) &&
    activeDestinations.every((d) => d !== compOrigin.toUpperCase());

  const handleDestinationChange = (index: number, value: string) => {
    setDestinations((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleCompare = useCallback(async () => {
    if (!canCompare) return;
    setError(null);
    setLoading(true);
    setCompareResult(null);
    try {
      const result = await regtechApi.compare(
        {
          origin: compOrigin,
          destinations: activeDestinations,
          hsCode: compProduct,
          declaredValueLocal: compVal,
          quantity: 1,
          costMatiereLocale: economics.costMatiereLocale,
          mainOeuvreLocale: economics.mainOeuvreLocale,
          fraisLocaux: economics.fraisLocaux,
          prixVenteExport: economics.prixVenteExport,
          year: 2026,
        },
        countries,
      );
      setCompareResult(result);
      recordUsage("simulations");
    } catch (err) {
      setCompareResult(null);
      setError(parseCompareError(err));
    } finally {
      setLoading(false);
    }
  }, [
    activeDestinations,
    canCompare,
    compOrigin,
    compProduct,
    compVal,
    countries,
    economics,
    recordUsage,
  ]);

  const cheapestCode = compareResult?.summary.cheapestDestination;
  const maxTaxUsd = compareResult?.results[compareResult.results.length - 1]?.totalTaxUSD ?? 1;

  return (
    <div className={`rounded-xl border p-6 space-y-6 ${panelClass}`} id="afcfta_compare_panel">
      <div className={`flex items-center gap-2 border-b pb-4 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <TrendingUp className="w-5 h-5 text-primary-500 shrink-0" aria-hidden />
        <div>
          <h3 className={`text-sm uppercase font-bold font-mono ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            Multi-destination comparison
          </h3>
          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Up to {maxDestinations} countries · 1 API request · sorted by fiscal cost (USD)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="compare_origin" className="text-xs font-semibold text-gray-500 block mb-2">
            Origin country
          </label>
          <SearchableSelect
            id="compare_origin"
            value={compOrigin}
            onChange={setOrigin}
            loading={refLoading}
            darkMode={darkMode}
            options={countryToOptions(countries)}
            placeholder="Select a country…"
            noDataPlaceholder="API required"
          />
        </div>

        <div>
          <label htmlFor="compare_hs" className="text-xs font-semibold text-gray-500 block mb-2">
            Product (HS code)
          </label>
          <SearchableSelect
            id="compare_hs"
            value={compProduct}
            onChange={setProduct}
            loading={refLoading}
            darkMode={darkMode}
            options={productToOptions(products)}
            placeholder="Code or description…"
            noDataPlaceholder="API required"
          />
        </div>

        <div>
          <label htmlFor="compare_value" className="text-xs font-semibold text-gray-500 block mb-2">
            Comparable value (origin currency)
          </label>
          <input
            id="compare_value"
            type="number"
            min={1}
            value={compVal}
            onChange={(e) => setDeclaredValue(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Destinations to compare
        </p>
        {[0, 1, 2].map((index) => {
          const disabled = index >= maxDestinations;
          return (
            <div key={index} className={disabled ? "opacity-40 pointer-events-none" : undefined}>
              <label
                htmlFor={`compare_dest_${index}`}
                className="text-[10px] font-bold text-gray-500 block mb-1.5"
              >
                Destination {index + 1}
                {disabled ? " (higher plan)" : ""}
              </label>
              <SearchableSelect
                id={`compare_dest_${index}`}
                value={destinations[index] ?? ""}
                onChange={(v) => handleDestinationChange(index, v)}
                loading={refLoading}
                darkMode={darkMode}
                options={countryToOptions(countries)}
                placeholder="Select a country…"
                noDataPlaceholder="—"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        id="btn_compare_destinations"
        onClick={() => void handleCompare()}
        disabled={!canCompare || loading}
        className={`w-full min-h-11 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all motion-safe:duration-200 ${
          !canCompare || loading
            ? "opacity-50 cursor-not-allowed bg-gray-600 text-gray-300"
            : darkMode
              ? "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              : "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Calculating…
          </>
        ) : (
          <>
            <ArrowRightLeft className="w-4 h-4" aria-hidden />
            Compare {activeDestinations.length || ""} destination
            {activeDestinations.length > 1 ? "s" : ""}
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          className={`rounded-lg border px-4 py-3 text-sm ${
            darkMode ? "bg-rose-950/30 border-rose-500/30 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <p>{error.message}</p>
          {(error.status === 402 || error.status === 403) && onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="mt-2 text-xs font-semibold underline underline-offset-2 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-rose-400 rounded"
            >
              View plans
            </button>
          )}
        </div>
      )}

      {compareResult && (
        <div className={`space-y-4 pt-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div
            className={`rounded-lg border px-4 py-3 text-xs font-mono ${
              darkMode ? "bg-[#101828] border-gray-800 text-gray-300" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <p>
              Cheapest:{" "}
              <strong className={darkMode ? "text-primary-300" : "text-primary-700"}>
                {compareResult.summary.cheapestDestination}
              </strong>
              {" · "}
              Spread:{" "}
              <strong>{compareResult.summary.spreadUSD.toLocaleString("en-US")} USD</strong>
            </p>
          </div>

          <ul className="space-y-3" aria-label="Comparison results">
            {compareResult.results.map((row) => {
              const isCheapest = row.countryCode === cheapestCode;
              const barWidth = maxTaxUsd > 0 ? Math.round((row.totalTaxUSD / maxTaxUsd) * 100) : 0;
              return (
                <li
                  key={row.countryCode}
                  className={`p-4 rounded-lg border transition-colors ${
                    isCheapest
                      ? darkMode
                        ? "bg-primary-500/5 border-primary-500/30"
                        : "bg-primary-50 border-primary-200"
                      : darkMode
                        ? "bg-[#101828] border-gray-800"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-2 ${
                          darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {row.rank}
                      </span>
                      <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {row.countryName}
                        <span className="font-mono text-gray-500 font-normal ml-1">({row.countryCode})</span>
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-1 border rounded shrink-0 ${
                        row.isEligiblePrefAfCFTA
                          ? darkMode
                            ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
                            : "bg-primary-100 text-primary-800 border-primary-200"
                          : darkMode
                            ? "bg-dark-secondary text-gray-400 border-gray-700"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {row.isEligiblePrefAfCFTA ? "Preferential" : "Standard"}
                    </span>
                  </div>

                  <p className={`font-mono text-sm font-bold mb-2 ${darkMode ? "text-primary-400" : "text-primary-700"}`}>
                    {row.totalTaxLocal.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                    {row.currency}
                    <span className="text-gray-500 font-normal text-xs ml-2">
                      ({row.totalTaxUSD.toLocaleString("en-US")} USD)
                    </span>
                  </p>

                  <div
                    className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
                    aria-hidden
                  >
                    <div
                      className={`h-full rounded-full motion-safe:transition-all motion-safe:duration-300 ${
                        isCheapest ? "bg-primary-500" : darkMode ? "bg-gray-600" : "bg-gray-400"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className={`text-[10px] mt-2 font-mono ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Duties {(row.appliedTariffRate * 100).toFixed(1)}% · Local VAT + duties
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!loading && !error && !compareResult && (
        <p className="text-xs text-gray-500">
          Select origin, product, and destinations, then run the comparison.
        </p>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { BookMarked, ShieldAlert, TrendingUp } from "lucide-react";
import type { Country, HSProduct } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { AfcftaDutyProjection } from "@/presentation/features/afcfta/AfcftaDutyProjection";
import { AfcftaToolsPanel } from "@/presentation/features/afcfta/AfcftaToolsPanel";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";

interface CompareRow {
  countryCode: string;
  countryName: string;
  currency: string;
  totalTaxLocal: number;
  isEligiblePrefAfCFTA: boolean;
}

interface AfcftaPageProps {
  countries: Country[];
  products: HSProduct[];
  refLoading?: boolean;
  darkMode?: boolean;
}

const panelClass = (darkMode: boolean) =>
  `rounded-xl border p-6 ${
    darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
  }`;

/** Zone d'échanges ZLECAf — règles, projection API, comparaison multi-destinations. */
export function AfcftaPage({
  countries,
  products,
  refLoading = false,
  darkMode = true,
}: AfcftaPageProps) {
  const [compProduct, setCompProduct] = useState("");
  const [compOrigin, setCompOrigin] = useState("");
  const [compVal, setCompVal] = useState(10_000_000);
  const [dest1, setDest1] = useState("");
  const [dest2, setDest2] = useState("");
  const [dest3, setDest3] = useState("");
  const [compTariffs, setCompTariffs] = useState<CompareRow[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm font-mono border ${
    darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900"
  }`;

  useEffect(() => {
    if (countries.length === 0) return;
    setCompOrigin((prev) => prev || countries[0].code);
    setDest1((prev) => prev || countries[0].code);
    setDest2((prev) => prev || countries[1]?.code || countries[0].code);
    setDest3((prev) => prev || countries[2]?.code || countries[0].code);
  }, [countries]);

  useEffect(() => {
    if (products.length > 0 && !compProduct) {
      setCompProduct(products[0].code);
    }
  }, [products, compProduct]);

  useEffect(() => {
    if (!compProduct || !compOrigin || compVal <= 0 || !dest1 || countries.length === 0) {
      setCompTariffs([]);
      return;
    }

    let cancelled = false;
    const destinations = [dest1, dest2, dest3].filter(Boolean);

    async function runCompare() {
      setCompLoading(true);
      try {
        const results = await Promise.all(
          destinations.map((dest) =>
            regtechApi.simulate({
              origin: compOrigin,
              destination: dest,
              hsCode: compProduct,
              declaredValueLocal: compVal,
              quantity: 1,
              costMatiereLocale: Math.round(compVal * 0.4),
              mainOeuvreLocale: Math.round(compVal * 0.15),
              fraisLocaux: Math.round(compVal * 0.1),
              prixVenteExport: compVal,
              year: 2026,
            }),
          ),
        );
        if (cancelled) return;
        setCompTariffs(
          results.map((r) => {
            const c = countries.find((x) => x.code === r.destination);
            return {
              countryCode: r.destination,
              countryName: c?.name ?? r.destination,
              currency: c?.currency ?? "",
              totalTaxLocal: r.totalTaxLocal,
              isEligiblePrefAfCFTA: r.isEligiblePrefAfCFTA,
            };
          }),
        );
      } catch {
        if (!cancelled) setCompTariffs([]);
      } finally {
        if (!cancelled) setCompLoading(false);
      }
    }

    const timer = window.setTimeout(() => void runCompare(), 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [compProduct, compOrigin, compVal, dest1, dest2, dest3, countries]);

  return (
    <div className="space-y-8 animate-fadeIn" id="afcfta_page">
      <div className={panelClass(darkMode)}>
        <h3 className={`text-lg font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
          AfCFTA rules directory & preferential treatment (AFT)
        </h3>
        <p className={`text-sm leading-relaxed mt-2 max-w-3xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          African-origin goods: preferential tax treatment based on local value addition, with a minimum of 40%
          (AfCFTA manual).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Colonne gauche : règles + projection + validation (utilise l'espace vertical) */}
        <div className="space-y-8">
          <div className={`${panelClass(darkMode)} space-y-5`}>
            <h4
              className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <BookMarked className="w-4 h-4 text-primary-500" />
              Local value addition level
            </h4>
            <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Eligibility criterion for continental preferential treatment.
            </p>
            <div
              className={`px-5 py-4 rounded-lg border text-center font-bold text-sm font-display ${
                darkMode ? "bg-[#101828] border-gray-800 text-primary-400" : "bg-primary-50 border-primary-200 text-primary-800"
              }`}
            >
              Economic compliance criterion: R_origin ≥ 40%
            </div>
          </div>

          <div className={panelClass(darkMode)}>
            <AfcftaDutyProjection
              originCountryIso={compOrigin}
              hsCode={compProduct}
              darkMode={darkMode}
            />
          </div>

          <AfcftaToolsPanel
            origin={compOrigin}
            hsCode={compProduct}
            declaredValue={compVal}
            darkMode={darkMode}
          />
        </div>

        {/* Colonne droite : alerte + comparateur (plus aéré) */}
        <div className="space-y-8">
          <div
            className={`rounded-xl border p-6 text-sm leading-relaxed ${
              darkMode ? "bg-rose-950/20 border-rose-500/20 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <h4 className="font-bold font-display flex items-center gap-2 text-base mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Sensitive goods — blacklist (AFT-04)
            </h4>
            <p>
              Automobiles, valuable textiles, code <strong>98010000</strong>: excluded from concessions,
              full-rate tax applied automatically.
            </p>
          </div>

          <div className={`${panelClass(darkMode)} space-y-5`}>
            <div className={`flex items-center gap-2 border-b pb-4 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h3 className={`text-sm uppercase font-bold font-mono ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                Multi-destination comparison
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-2">Origin country</label>
                <SearchableSelect
                  value={compOrigin}
                  onChange={setCompOrigin}
                  loading={refLoading}
                  darkMode={darkMode}
                  options={countryToOptions(countries)}
                  placeholder="Select a country…"
                  noDataPlaceholder="API required"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-2">Product (HS code)</label>
                <SearchableSelect
                  value={compProduct}
                  onChange={setCompProduct}
                  loading={refLoading}
                  darkMode={darkMode}
                  options={productToOptions(products)}
                  placeholder="Code or description…"
                  noDataPlaceholder="API required"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-2">Comparable value (FCFA)</label>
                <input
                  type="number"
                  value={compVal}
                  onChange={(e) => setCompVal(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Destinations to compare</p>
              {[
                { label: "Destination 1", value: dest1, set: setDest1 },
                { label: "Destination 2", value: dest2, set: setDest2 },
                { label: "Destination 3", value: dest3, set: setDest3 },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1.5">{label}</label>
                  <SearchableSelect
                    value={value}
                    onChange={set}
                    loading={refLoading}
                    darkMode={darkMode}
                    options={countryToOptions(countries)}
                    placeholder="Select a country…"
                    noDataPlaceholder="—"
                  />
                </div>
              ))}
            </div>

            <div className={`space-y-3 pt-5 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              {compLoading && <p className="text-xs text-gray-500 font-mono">Calculating…</p>}
              {!compLoading && compTariffs.length === 0 && (
                <p className="text-xs text-gray-500">Select origin, product, and value to compare.</p>
              )}
              {compTariffs.map((c, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {c.countryName}
                      <span className="font-mono text-gray-500 font-normal ml-1">({c.countryCode})</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-1 border rounded shrink-0 ${
                        c.isEligiblePrefAfCFTA
                          ? darkMode
                            ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
                            : "bg-primary-100 text-primary-800 border-primary-200"
                          : darkMode
                            ? "bg-dark-secondary text-gray-400 border-gray-700"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {c.isEligiblePrefAfCFTA ? "Preferential" : "Standard"}
                    </span>
                  </div>
                  <p className={`font-mono text-sm font-bold ${darkMode ? "text-primary-400" : "text-primary-700"}`}>
                    {c.totalTaxLocal.toLocaleString("en-US", { maximumFractionDigits: 0 })} {c.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

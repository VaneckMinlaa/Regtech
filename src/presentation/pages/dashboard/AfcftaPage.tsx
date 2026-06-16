import React, { useEffect, useState } from "react";
import type { Country, HSProduct } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { AfcftaDutyProjection } from "@/presentation/features/afcfta/AfcftaDutyProjection";
import { AfcftaToolsPanel } from "@/presentation/features/afcfta/AfcftaToolsPanel";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { platform } from "@/presentation/theme/platformStyles";

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

  const inputClass = platform.input(darkMode);

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
    <div className="animate-fadeIn space-y-8" id="afcfta_page">
      <section className="space-y-4 border-b pb-8">
        <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          Local value addition level
        </h2>
        <p className={`text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>
          Eligibility criterion for continental preferential treatment. Economic compliance criterion: R_origin ≥ 40%.
        </p>
      </section>

      <AfcftaDutyProjection
        originCountryIso={compOrigin}
        hsCode={compProduct}
        darkMode={darkMode}
      />

      <AfcftaToolsPanel
        origin={compOrigin}
        hsCode={compProduct}
        declaredValue={compVal}
        darkMode={darkMode}
      />

      <p className={`text-sm leading-relaxed text-rose-500`}>
        <strong>Sensitive goods — blacklist (AFT-04).</strong> Automobiles, valuable textiles, code{" "}
        <strong>98010000</strong>: excluded from concessions, full-rate tax applied automatically.
      </p>

      <section className={`space-y-5 border-t pt-8 ${platform.borderSubtle(darkMode)}`}>
        <h3 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          Multi-destination comparison
        </h3>

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
              className={`border-b py-4 last:border-b-0 ${darkMode ? "border-gray-800" : "border-gray-200"}`}
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
      </section>
    </div>
  );
}

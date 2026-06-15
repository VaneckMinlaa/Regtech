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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="afcfta_page">
      <div
        className={`border rounded-lg p-6 space-y-6 lg:col-span-8 ${
          darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
        }`}
      >
        <div>
          <h3 className={`text-base font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
            Annuaire des Règles ZLECAf & Traitement Préférentiel (AFT)
          </h3>
          <p className={`text-xs leading-normal mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Selon la charte de l&apos;AfCFTA, de nombreuses marchandises originaires de l&apos;Afrique bénéficient
            d&apos;un traitement fiscal préférentiel. Critère de valeur ajoutée locale minimum de 40 % (Manuel ZLECAf).
          </p>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <h4
            className={`text-xs font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-primary-500" />
            <span>Niveau de valeur ajoutée locale</span>
          </h4>
          <div
            className={`px-4 py-3 rounded-lg border text-center font-bold text-sm font-display ${
              darkMode ? "bg-dark-primary border-gray-800 text-primary-400" : "bg-primary-50 border-primary-200 text-primary-800"
            }`}
          >
            Critère de conformité économique : R_origine ≥ 40%
          </div>
        </div>

        <AfcftaDutyProjection
          originCountryIso={compOrigin}
          hsCode={compProduct}
          darkMode={darkMode}
        />
      </div>

      <div className="lg:col-span-4 space-y-6 lg:col-start-9">
        <div
          className={`p-4 rounded-xl text-xs space-y-2 border ${
            darkMode ? "bg-rose-950/20 border-rose-500/20" : "bg-rose-50 border-rose-250 text-rose-900 shadow-sm"
          }`}
        >
          <h4
            className={`font-bold font-display flex items-center gap-1 text-sm ${
              darkMode ? "text-rose-300" : "text-rose-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Biens sensibles — Liste noire (AFT-04)</span>
          </h4>
          <p className={darkMode ? "text-rose-400/95" : "text-rose-700/90"}>
            Produits sensibles (automobiles, textiles précieux, code <strong>98010000</strong>) : taxe pleine sans abattement.
          </p>
        </div>

        <div
          className={`border rounded-lg p-5 space-y-4 ${
            darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
          }`}
        >
          <div className={`flex items-center gap-2 border-b pb-3 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h3 className={`text-xs uppercase font-bold font-mono ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              Comparaison multi-destinations
            </h3>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1">PAYS D&apos;ORIGINE</label>
            <SearchableSelect
              value={compOrigin}
              onChange={setCompOrigin}
              loading={refLoading}
              darkMode={darkMode}
              dense
              options={countryToOptions(countries)}
              placeholder="Pays…"
              noDataPlaceholder="API requise"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1">PRODUIT (HS)</label>
            <SearchableSelect
              value={compProduct}
              onChange={setCompProduct}
              loading={refLoading}
              darkMode={darkMode}
              dense
              options={productToOptions(products)}
              placeholder="Code HS…"
              noDataPlaceholder="API requise"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1">VALEUR COMPARABLE (FCFA)</label>
            <input
              type="number"
              value={compVal}
              onChange={(e) => setCompVal(Number(e.target.value))}
              className={`w-full rounded px-2.5 py-1.5 text-xs font-mono ${
                darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "PAYS 1", value: dest1, set: setDest1 },
              { label: "PAYS 2", value: dest2, set: setDest2 },
              { label: "PAYS 3", value: dest3, set: setDest3 },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-[9px] text-gray-500 block mb-0.5 font-bold">{label}</label>
                <SearchableSelect
                  value={value}
                  onChange={set}
                  loading={refLoading}
                  darkMode={darkMode}
                  dense
                  options={countryToOptions(countries)}
                  placeholder="…"
                  noDataPlaceholder="—"
                />
              </div>
            ))}
          </div>

          <div className={`space-y-2 mt-4 pt-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            {compLoading && <p className="text-[10px] text-gray-500 font-mono">Calcul en cours…</p>}
            {compTariffs.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded border ${
                  darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {c.countryName} ({c.countryCode})
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${
                      c.isEligiblePrefAfCFTA
                        ? darkMode
                          ? "bg-primary-500/10 text-primary-300 border-primary-500/20"
                          : "bg-primary-100 text-primary-800 border-primary-200"
                        : darkMode
                          ? "bg-dark-secondary text-gray-400 border-gray-700"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {c.isEligiblePrefAfCFTA ? "Préférentiel" : "Standard"}
                  </span>
                </div>
                <div className={`font-mono text-[11px] font-bold ${darkMode ? "text-primary-400" : "text-primary-700"}`}>
                  {c.totalTaxLocal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {c.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AfcftaToolsPanel
          origin={compOrigin}
          hsCode={compProduct}
          declaredValue={compVal}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

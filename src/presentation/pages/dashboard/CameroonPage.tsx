import React, { useState } from "react";
import { Landmark } from "lucide-react";
import { CameroonFiscalPreview } from "@/presentation/features/tariff-calculator/CameroonFiscalPreview";
import { CameroonApiTools } from "@/presentation/features/procedures/CameroonApiTools";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";

interface CameroonPageProps {
  darkMode?: boolean;
}

/** F-05 / F-06 — Moteur fiscal Cameroun et outils logistiques. */
export function CameroonPage({ darkMode = true }: CameroonPageProps) {
  const { countries, products, isLoading } = useReferenceData();
  const [cifValue, setCifValue] = useState(10_000_000);
  const [hsCode, setHsCode] = useState("");
  const [origin, setOrigin] = useState("NGA");
  const [year, setYear] = useState(2026);
  const [applyZlecaf, setApplyZlecaf] = useState(true);

  const inputClass = `w-full rounded-lg px-3 py-2 text-xs font-mono border ${
    darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300"
  }`;

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="cameroon_page">
      <div
        className={`rounded-xl border p-5 ${
          darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-start gap-3">
          <Landmark className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <h2 className={`text-lg font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
              Cameroon fiscality & logistics
            </h2>
            <p className={`text-xs mt-1 max-w-2xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              CEMAC tax engine (customs duties, VAT, excise), PAD/Kribi port fees, CAMCIS regimes, and landed cost.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
          <h3 className={`text-sm font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Cameroon tax simulator
          </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[9px] font-bold text-gray-500 block mb-1">CIF VALUE (XAF)</label>
            <input
              type="number"
              value={cifValue}
              onChange={(e) => setCifValue(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-gray-500 block mb-1">HS CODE</label>
            <SearchableSelect
              value={hsCode}
              onChange={setHsCode}
              loading={isLoading}
              darkMode={darkMode}
              dense
              options={productToOptions(products)}
              placeholder="HS product…"
              noDataPlaceholder="API required"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-gray-500 block mb-1">ORIGIN</label>
            <SearchableSelect
              value={origin}
              onChange={setOrigin}
              loading={isLoading}
              darkMode={darkMode}
              dense
              options={countryToOptions(countries)}
              placeholder="Origin country…"
              noDataPlaceholder="API required"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-gray-500 block mb-1">YEAR</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 mt-3 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={applyZlecaf}
            onChange={(e) => setApplyZlecaf(e.target.checked)}
            className="rounded border-gray-600 text-primary-600"
          />
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Apply AfCFTA concessions if eligible</span>
        </label>

        {hsCode && cifValue > 0 && (
          <CameroonFiscalPreview
            cifValue={cifValue}
            hsCode={hsCode}
            originCountryIso={origin}
            year={year}
            applyZlecaf={applyZlecaf}
            darkMode={darkMode}
          />
        )}
      </div>

      <CameroonApiTools darkMode={darkMode} />
    </div>
  );
}

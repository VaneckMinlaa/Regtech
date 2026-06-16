import React, { useState } from "react";
import { CameroonFiscalPreview } from "@/presentation/features/tariff-calculator/CameroonFiscalPreview";
import { CameroonApiTools } from "@/presentation/features/procedures/CameroonApiTools";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { platform } from "@/presentation/theme/platformStyles";

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

  const inputClass = platform.input(darkMode);
  return (
    <div className="animate-fadeIn space-y-8 font-sans" id="cameroon_page">
      <section className="space-y-6">
        <div className="flex flex-col gap-4">
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
      </section>

      <CameroonApiTools darkMode={darkMode} />
    </div>
  );
}

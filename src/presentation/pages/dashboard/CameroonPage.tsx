import React, { useState } from "react";
import { CameroonFiscalPreview } from "@/presentation/features/tariff-calculator/CameroonFiscalPreview";
import { CameroonApiTools } from "@/presentation/features/procedures/CameroonApiTools";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { CameroonPageSkeleton } from "@/presentation/components/shared/PlatformSkeletons";
import { platform } from "@/presentation/theme/platformStyles";

interface CameroonPageProps {
  darkMode?: boolean;
}

/** Cameroon fiscal engine and logistics tools. */
export function CameroonPage({ darkMode = true }: CameroonPageProps) {
  const { countries, products, isLoading } = useReferenceData();
  const [cifValue, setCifValue] = useState(10_000_000);
  const [hsCode, setHsCode] = useState("");
  const [origin, setOrigin] = useState("NGA");
  const [year, setYear] = useState(2026);
  const [applyZlecaf, setApplyZlecaf] = useState(true);

  const inputClass = platform.input(darkMode);

  if (isLoading) {
    return <CameroonPageSkeleton darkMode={darkMode} />;
  }

  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="cameroon_page">
      <SectionPanel darkMode={darkMode} id="cameroon_fiscal_inputs">
        <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          Cameroon fiscal estimate
        </h2>
        <p className={`mt-1 text-sm ${platform.textMuted(darkMode)}`}>
          Enter CIF value, HS code, and origin to estimate CEMAC duties and taxes.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={platform.fieldLabel(darkMode)}>CIF value (XAF)</label>
            <input
              type="number"
              value={cifValue}
              onChange={(e) => setCifValue(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={platform.fieldLabel(darkMode)}>HS code</label>
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
            <label className={platform.fieldLabel(darkMode)}>Origin</label>
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
            <label className={platform.fieldLabel(darkMode)}>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={applyZlecaf}
            onChange={(e) => setApplyZlecaf(e.target.checked)}
            className="rounded border-gray-600 text-primary-600"
          />
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Apply AfCFTA concessions if eligible</span>
        </label>
      </SectionPanel>

      {hsCode && cifValue > 0 && (
        <SectionPanel darkMode={darkMode} id="cameroon_fiscal_results">
          <CameroonFiscalPreview
            cifValue={cifValue}
            hsCode={hsCode}
            originCountryIso={origin}
            year={year}
            applyZlecaf={applyZlecaf}
            darkMode={darkMode}
          />
        </SectionPanel>
      )}

      <SectionPanel darkMode={darkMode} id="cameroon_api_tools_panel">
        <CameroonApiTools darkMode={darkMode} />
      </SectionPanel>
    </div>
  );
}

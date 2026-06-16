import React, { useEffect, useState } from "react";
import type { Country, HSProduct } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import {
  AfcftaDutyProjection,
  AfcftaReductionsHelpText,
} from "@/presentation/features/afcfta/AfcftaDutyProjection";
import { AfcftaToolsPanel } from "@/presentation/features/afcfta/AfcftaToolsPanel";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
import { HelpToggle } from "@/presentation/components/shared/HelpToggle";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";
import { PAGE_INTROS } from "@/presentation/layout/pageIntros";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { platform } from "@/presentation/theme/platformStyles";
import {
  AfcftaPageSkeleton,
  CompareRowsSkeleton,
} from "@/presentation/components/shared/PlatformSkeletons";

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

/** AfCFTA rules — projection API, validation, multi-destination comparison. */
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

  if (refLoading) {
    return <AfcftaPageSkeleton darkMode={darkMode} />;
  }

  return (
    <div className="animate-fadeIn space-y-5" id="afcfta_page">
      <PlatformPageIntro
        title={PAGE_INTROS.AFT.title}
        description={PAGE_INTROS.AFT.description}
        darkMode={darkMode}
        help={{
          label: "What are progressive AfCFTA reductions?",
          children: <AfcftaReductionsHelpText />,
        }}
      />

      <div className="space-y-4">
        <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          Local value addition level
        </h2>
        <p className={`text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>
          Eligibility criterion for continental preferential treatment. Economic compliance criterion: R_origin ≥
          40%.
        </p>
      </div>

      <div id="afcfta_validation_panel">
        <HelpToggle
          title="AfCFTA origin validation & certificate"
          description="Production inputs used to calculate local value addition"
          label="Is this eligible for AfCFTA?"
          darkMode={darkMode}
          expandAsPanel
        >
          <AfcftaToolsPanel
            origin={compOrigin}
            hsCode={compProduct}
            declaredValue={compVal}
            darkMode={darkMode}
            embedded
          />
        </HelpToggle>
      </div>

      <p className={`text-sm leading-relaxed text-rose-500`} id="afcfta_sensitive_goods">
        <strong>Sensitive goods — blacklist (AFT-04).</strong> Automobiles, valuable textiles, code{" "}
        <strong>98010000</strong>: excluded from concessions, full-rate tax applied automatically.
      </p>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <SectionPanel darkMode={darkMode} id="afcfta_duty_projection_panel">
          <AfcftaDutyProjection
            originCountryIso={compOrigin}
            hsCode={compProduct}
            darkMode={darkMode}
          />
        </SectionPanel>

        <SectionPanel darkMode={darkMode} id="afcfta_compare_panel">
          <h3 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
            Multi-destination comparison
          </h3>

          <div className="mt-6 space-y-4">
            <div>
              <label className={platform.fieldLabel(darkMode)}>Origin country</label>
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
              <label className={platform.fieldLabel(darkMode)}>Product (HS code)</label>
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
              <label className={platform.fieldLabel(darkMode)}>Comparable value (FCFA)</label>
              <input
                type="number"
                value={compVal}
                onChange={(e) => setCompVal(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className={platform.fieldLabel(darkMode)}>Destinations to compare</p>
            {[
              { label: "Destination 1", value: dest1, set: setDest1 },
              { label: "Destination 2", value: dest2, set: setDest2 },
              { label: "Destination 3", value: dest3, set: setDest3 },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className={`text-xs font-medium mb-1.5 block ${platform.textMuted(darkMode)}`}>
                  {label}
                </label>
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

          <div className={`mt-6 space-y-3 border-t pt-6 ${platform.borderSubtle(darkMode)}`}>
            {compLoading && <CompareRowsSkeleton darkMode={darkMode} rows={3} />}
            {!compLoading && compTariffs.length === 0 && (
              <p className={`text-sm ${platform.textMuted(darkMode)}`}>
                Select origin, product, and value to compare.
              </p>
            )}
            {compTariffs.map((c, i) => (
              <div
                key={i}
                className={`flex flex-wrap items-center justify-between gap-3 border-b py-4 last:border-b-0 ${platform.borderSubtle(darkMode)}`}
              >
                <div>
                  <span className={`font-semibold text-sm ${platform.textPrimary(darkMode)}`}>
                    {c.countryName}
                  </span>
                  <span className={`ml-1 font-mono text-xs ${platform.textMuted(darkMode)}`}>
                    ({c.countryCode})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
                      c.isEligiblePrefAfCFTA
                        ? darkMode
                          ? "bg-primary-500/15 text-primary-300"
                          : "bg-primary-50 text-primary-700"
                        : darkMode
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {c.isEligiblePrefAfCFTA ? "Preferential" : "Standard"}
                  </span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {c.totalTaxLocal.toLocaleString("en-US", { maximumFractionDigits: 0 })} {c.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}

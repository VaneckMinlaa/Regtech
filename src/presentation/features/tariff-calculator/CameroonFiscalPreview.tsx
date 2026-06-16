import React, { useEffect, useState } from "react";
import { Landmark, AlertCircle } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { CameroonFiscalResponse } from "@/infrastructure/http/regtechApiTypes";
import { platform } from "@/presentation/theme/platformStyles";
import { TableRowsSkeleton } from "@/presentation/components/shared/PlatformSkeletons";

interface CameroonFiscalPreviewProps {
  cifValue: number;
  hsCode?: string;
  originCountryIso?: string;
  year?: number;
  applyZlecaf?: boolean;
  darkMode?: boolean;
}

function localFallback(cifValue: number, hsCode: string) {
  const ddiRate = hsCode.startsWith("87") ? 0.3 : 0.2;
  const ddi = Math.round(cifValue * ddiRate);
  const dac = Math.round(cifValue * 0.05);
  const baseTva = cifValue + ddi + dac;
  const tva = Math.round(baseTva * 0.1925);
  const tci = Math.round(cifValue * 0.01);
  const rid = Math.round(cifValue * 0.005);
  return {
    lines: [
      { code: "DDI", label: "Import customs duty", amount: ddi, rate: ddiRate },
      { code: "DAC", label: "Excise duty", amount: dac, rate: 0.05 },
      { code: "TVA", label: "TVA", amount: tva, rate: 0.1925 },
      { code: "TCI", label: "TCI CEMAC", amount: tci, rate: 0.01 },
      { code: "RID", label: "IT levy", amount: rid, rate: 0.005 },
    ],
    totalTaxes: ddi + dac + tva + tci + rid,
    totalEstimatedCostPctCif: ((ddi + dac + tva + tci + rid) / cifValue) * 100,
    disclaimer: "Local estimate (API unavailable)",
    zlecafAppliedRate: null as number | null,
  };
}

/** Détail fiscal Cameroun — ventilation via API `/cameroon/fiscal`. */
export function CameroonFiscalPreview({
  cifValue,
  hsCode = "",
  originCountryIso = "CMR",
  year = 2026,
  applyZlecaf = true,
  darkMode = true,
}: CameroonFiscalPreviewProps) {
  const [data, setData] = useState<CameroonFiscalResponse | ReturnType<typeof localFallback> | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiLinked, setApiLinked] = useState(false);

  useEffect(() => {
    if (cifValue <= 0 || !hsCode) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void regtechApi
      .computeCameroonFiscal({
        cifValue,
        hsCode,
        originCountryIso,
        year,
        applyZlecaf,
      })
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setApiLinked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(localFallback(cifValue, hsCode));
          setApiLinked(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cifValue, hsCode, originCountryIso, year, applyZlecaf]);

  if (cifValue <= 0) return null;

  return (
    <div className={`mt-4 border-t pt-6 ${platform.borderSubtle(darkMode)}`} id="cameroon_fiscal_preview">
      <div className="mb-3 flex items-center gap-2">
        <Landmark className="h-4 w-4 text-primary-500" />
        <h4 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          Cameroon tax breakdown
        </h4>
        {!loading && !apiLinked && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-amber-400">
            <AlertCircle className="h-3 w-3" />
            offline
          </span>
        )}
      </div>

      {loading && <TableRowsSkeleton darkMode={darkMode} rows={5} />}

      {!loading && data && (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className={platform.textMuted(darkMode)}>
                <th className="text-left py-2 font-medium">Code</th>
                <th className="py-2 text-left font-medium">Label</th>
                <th className="text-right py-2 font-medium">Rate</th>
                <th className="text-right py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className={platform.textSecondary(darkMode)}>
              {data.lines.map((row) => (
                <tr key={row.code} className={`border-t ${platform.borderSubtle(darkMode)}`}>
                  <td className="py-2 font-mono font-semibold text-primary-600 dark:text-primary-400">{row.code}</td>
                  <td className="py-2">{"label" in row ? row.label : ""}</td>
                  <td className="py-2 text-right font-mono">
                    {(row.rate * 100).toFixed(row.rate < 0.1 ? 1 : 0)}%
                  </td>
                  <td className="py-2 text-right font-mono">
                    {row.amount.toLocaleString("en-US")} XAF
                  </td>
                </tr>
              ))}
              <tr className={`border-t font-semibold ${platform.textPrimary(darkMode)}`}>
                <td colSpan={3} className="py-2">
                  Total estimated taxes
                </td>
                <td className="py-2 text-right font-mono text-primary-500">
                  {data.totalTaxes.toLocaleString("en-US")} XAF
                </td>
              </tr>
            </tbody>
          </table>
          <p className={`text-sm mt-2 ${platform.textMuted(darkMode)}`}>
            ~{data.totalEstimatedCostPctCif.toFixed(0)}% of CIF value
            {data.zlecafAppliedRate != null && (
              <> · AfCFTA {(data.zlecafAppliedRate * 100).toFixed(1)}%</>
            )}
          </p>
          {data.disclaimer && (
            <p className={`text-[9px] mt-1 italic ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
              {data.disclaimer}
            </p>
          )}
        </>
      )}
    </div>
  );
}

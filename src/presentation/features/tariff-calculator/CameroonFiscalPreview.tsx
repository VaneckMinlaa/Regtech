import React, { useEffect, useState } from "react";
import { Landmark, Loader2, AlertCircle } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { CameroonFiscalResponse } from "@/infrastructure/http/regtechApiTypes";

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
      { code: "DDI", label: "Droit de douane", amount: ddi, rate: ddiRate },
      { code: "DAC", label: "Accises", amount: dac, rate: 0.05 },
      { code: "TVA", label: "TVA", amount: tva, rate: 0.1925 },
      { code: "TCI", label: "TCI CEMAC", amount: tci, rate: 0.01 },
      { code: "RID", label: "Redev. informatique", amount: rid, rate: 0.005 },
    ],
    totalTaxes: ddi + dac + tva + tci + rid,
    totalEstimatedCostPctCif: ((ddi + dac + tva + tci + rid) / cifValue) * 100,
    disclaimer: "Estimation locale (API indisponible)",
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
    <div
      className={`rounded-lg border p-4 mt-4 ${
        darkMode ? "border-gray-800 bg-dark-primary/50" : "border-gray-200 bg-gray-50"
      }`}
      id="cameroon_fiscal_preview"
    >
      <div className="flex items-center gap-2 mb-3">
        <Landmark className="w-4 h-4 text-primary-500" />
        <h4 className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          Détail fiscal Cameroun
        </h4>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500 ml-auto" />}
        {!loading && !apiLinked && (
          <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-amber-400">
            <AlertCircle className="w-3 h-3" />
            hors ligne
          </span>
        )}
      </div>

      {data && (
        <>
          <table className="w-full text-[11px]">
            <thead>
              <tr className={darkMode ? "text-gray-500" : "text-gray-500"}>
                <th className="text-left py-1">Code</th>
                <th className="text-left py-1">Libellé</th>
                <th className="text-right py-1">Taux</th>
                <th className="text-right py-1">Montant</th>
              </tr>
            </thead>
            <tbody className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {data.lines.map((row) => (
                <tr key={row.code} className="border-t border-gray-800/30">
                  <td className="py-1.5 font-mono text-amber-500">{row.code}</td>
                  <td className="py-1.5">{"label" in row ? row.label : ""}</td>
                  <td className="py-1.5 text-right font-mono">
                    {(row.rate * 100).toFixed(row.rate < 0.1 ? 1 : 0)}%
                  </td>
                  <td className="py-1.5 text-right font-mono">
                    {row.amount.toLocaleString("en-US")} XAF
                  </td>
                </tr>
              ))}
              <tr className={`border-t font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                <td colSpan={3} className="py-2">
                  Total taxes estimé
                </td>
                <td className="py-2 text-right font-mono text-primary-400">
                  {data.totalTaxes.toLocaleString("en-US")} XAF
                </td>
              </tr>
            </tbody>
          </table>
          <p className={`text-[10px] mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            ~{data.totalEstimatedCostPctCif.toFixed(0)} % de la valeur CIF
            {data.zlecafAppliedRate != null && (
              <> · ZLECAf { (data.zlecafAppliedRate * 100).toFixed(1)}%</>
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

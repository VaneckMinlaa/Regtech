import React from "react";
import { Landmark } from "lucide-react";

interface CameroonFiscalPreviewProps {
  cifValue: number;
  hsCode?: string;
  darkMode?: boolean;
}

/** Détail fiscal Cameroun — ventilation DDI, TVA, accises et redevances. */
export function CameroonFiscalPreview({
  cifValue,
  hsCode = "",
  darkMode = true,
}: CameroonFiscalPreviewProps) {
  if (cifValue <= 0) return null;

  const ddiRate = hsCode.startsWith("87") ? 0.3 : 0.2;
  const ddi = Math.round(cifValue * ddiRate);
  const dac = Math.round(cifValue * 0.05);
  const baseTva = cifValue + ddi + dac;
  const tva = Math.round(baseTva * 0.1925);
  const tci = Math.round(cifValue * 0.01);
  const rid = Math.round(cifValue * 0.005);
  const total = ddi + dac + tva + tci + rid;

  const lines = [
    { code: "DDI", label: "Droit de douane", amount: ddi, rate: `${ddiRate * 100}%` },
    { code: "DAC", label: "Accises", amount: dac, rate: "5%" },
    { code: "TVA", label: "TVA", amount: tva, rate: "19,25%" },
    { code: "TCI", label: "TCI CEMAC", amount: tci, rate: "1%" },
    { code: "RID", label: "Redev. informatique", amount: rid, rate: "0,5%" },
  ];

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
      </div>
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
          {lines.map((row) => (
            <tr key={row.code} className="border-t border-gray-800/30">
              <td className="py-1.5 font-mono text-amber-500">{row.code}</td>
              <td className="py-1.5">{row.label}</td>
              <td className="py-1.5 text-right font-mono">{row.rate}</td>
              <td className="py-1.5 text-right font-mono">
                {row.amount.toLocaleString("fr-FR")} XAF
              </td>
            </tr>
          ))}
          <tr className={`border-t font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            <td colSpan={3} className="py-2">
              Total taxes estimé
            </td>
            <td className="py-2 text-right font-mono text-primary-400">
              {total.toLocaleString("fr-FR")} XAF
            </td>
          </tr>
        </tbody>
      </table>
      <p className={`text-[10px] mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
        ~{((total / cifValue) * 100).toFixed(0)} % de la valeur CIF
      </p>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { FileDown, Printer, ShieldAlert, BadgeCheck, FileText } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { DECLARATION_PRINT_CSS } from "@/presentation/features/export/declarationPrintStyles";

interface DeclarationSummaryProps {
  simulation: SimulationResult;
  darkMode?: boolean;
}

function formatAmount(value: number, currency?: string): string {
  const formatted = value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return currency ? `${formatted} ${currency}` : formatted;
}

export const DeclarationSummary: React.FC<DeclarationSummaryProps> = ({
  simulation,
  darkMode = true,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { countries } = useReferenceData();

  const originCountry = countries.find((c) => c.code === simulation.origin);
  const destCountry = countries.find((c) => c.code === simulation.destination);
  const originThreshold = simulation.originValueThresholdPct ?? 40;
  const vatPct = destCountry ? destCountry.vatRate * 100 : 0;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Certificat ZLECAf — ${simulation.id}</title>
  <style>${DECLARATION_PRINT_CSS}</style>
</head>
<body onload="window.print();window.close()">
  <div class="cert-sheet">${printContent}</div>
</body>
</html>`);
    win.document.close();
  };

  const downloadTextReceipt = () => {
    const textContent = `
========================================================================
             FICHE BANCAIRE DE DECLARATION PREFERENTIELLE ZLECAf
========================================================================
ID Simulation       : ${simulation.id}
Date d'Emission     : ${new Date(simulation.date).toLocaleDateString("fr-FR")}
Année d'Abattement : ${simulation.year}
------------------------------------------------------------------------
PARTIE EXPÉDITEUR / ORIGINE:
Pays d'Origine      : ${originCountry?.name} (${simulation.origin})
Devise Locale       : ${originCountry?.currency}
Valeur Déclarée    : ${formatAmount(simulation.declaredValueLocal, originCountry?.currency)} (${formatAmount(simulation.declaredValueUSD, "USD")})
Valeur Ajoutée Loc. : ${simulation.localOriginValueRatio}% (Requis: >= ${originThreshold}%)
Éligible ZLECAf     : ${simulation.isEligiblePrefAfCFTA ? "OUI" : "NON"}

PARTIE DESTINATAIRE / DOUANE:
Pays de Destination : ${destCountry?.name} (${simulation.destination})
Désignation Produit : ${simulation.productDescription}
Nomenclature HS-Code: ${simulation.hsCode}

TAUX & CALCULS:
Droit de Douane     : ${(simulation.appliedTariffRate * 100).toFixed(1)}% → ${formatAmount(simulation.dutyPaidLocal, destCountry?.currency)}
TVA (${vatPct.toFixed(2)}%)        : ${formatAmount(simulation.vatPaidLocal, destCountry?.currency)}
------------------------------------------------------------------------
TOTAL ESTIMÉ        : ${formatAmount(simulation.totalTaxLocal, destCountry?.currency)} (≈ ${formatAmount(simulation.totalTaxUSD, "USD")})
========================================================================
Document généré par RegTech — Assistant douanier AfCFTA
========================================================================
    `;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Declaration_ZLECAf_${simulation.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const thClass = `px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold ${
    darkMode ? "bg-dark-secondary text-gray-400" : "bg-gray-100 text-gray-600"
  }`;
  const tdClass = `px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`;
  const tdNum = `${tdClass} text-right font-mono tabular-nums whitespace-nowrap`;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 font-sans ${
        darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}
      id="summary_receipt_panel"
    >
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          darkMode ? "bg-dark-secondary border-gray-800" : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary-500" />
          <div>
            <h3 className={`text-sm font-bold font-display ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Bordereau de Simulation Douanière
            </h3>
            <p className={`text-[10px] font-mono mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              ID: {simulation.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadTextReceipt}
            id="btn_download_receipt"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg font-medium ${
              darkMode
                ? "bg-dark-secondary text-gray-300 hover:bg-gray-700 border-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            Exporter TXT
          </button>
          <button
            type="button"
            onClick={handlePrint}
            id="btn_print_receipt"
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
        </div>
      </div>

      <div
        id="printable_summary_content"
        ref={printRef}
        className={`px-8 py-8 ${darkMode ? "bg-[#101828] text-gray-200" : "bg-white text-gray-800"}`}
      >
        <div className={`cert-header text-center border-b border-dashed pb-6 mb-8 ${
          darkMode ? "border-gray-700" : "border-gray-300"
        }`}>
          <div className="regime text-primary-500 font-extrabold uppercase tracking-widest text-xs">
            Régime Préférentiel Douanier AfCFTA / ZLECAf
          </div>
          <h1 className={`text-xl font-black font-display mt-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            CERTIFICAT PRO-FORMA D&apos;ÉLIGIBILITÉ
          </h1>
          <p className={`ref text-[11px] mt-2 uppercase font-mono ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Réf. {simulation.id} · {new Date(simulation.date).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="mb-8">
          {simulation.isEligiblePrefAfCFTA ? (
            <div
              className={`cert-banner ok rounded-lg p-4 flex gap-3 ${
                darkMode ? "bg-primary-950/40 border border-primary-500/30 text-primary-200" : "bg-primary-50 border border-primary-200 text-primary-900"
              }`}
            >
              <BadgeCheck className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-extrabold block mb-1">TRAITEMENT PRÉFÉRENTIEL COMPATIBLE</strong>
                <p className="text-sm leading-relaxed">
                  Valeur ajoutée locale vérifiée ({simulation.localOriginValueRatio}% / seuil {originThreshold}%).
                  Abattement tarifaire année {simulation.year}.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`cert-banner ko rounded-lg p-4 flex gap-3 ${
                darkMode ? "bg-rose-950/40 border border-rose-500/30 text-rose-200" : "bg-rose-50 border border-rose-200 text-rose-900"
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-extrabold block mb-1">RÉGIME DOUANIER STANDARD APPLIQUÉ</strong>
                <p className="text-sm leading-relaxed">
                  {simulation.sensitiveExclusion
                    ? "Produit sensible ou exclu de l'accord AfCFTA."
                    : `Valeur ajoutée locale insuffisante (${simulation.localOriginValueRatio}% / seuil ${originThreshold}%).`}
                  {" "}Droits perçus au plein tarif.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`cert-grid grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8 mb-8 border-b ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}>
          <div>
            <h2 className={`cert-section-title ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Origine &amp; Expéditeur
            </h2>
            <p className={`name font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
              {originCountry?.name ?? simulation.origin}
            </p>
            <p className={`sub text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Exportateur AfCFTA · Code {simulation.origin}
            </p>
            <div className={`cert-box mt-4 rounded-lg px-4 py-3 border text-xs font-mono ${
              darkMode ? "bg-dark-primary border-gray-800" : "bg-gray-50 border-gray-200"
            }`}>
              <div>Valeur déclarée</div>
              <div className={`font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatAmount(simulation.declaredValueLocal, originCountry?.currency)}
              </div>
              <div className={`muted text-[11px] mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                ≈ {formatAmount(simulation.declaredValueUSD, "USD")}
              </div>
            </div>
          </div>

          <div>
            <h2 className={`cert-section-title ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Destination &amp; Douane
            </h2>
            <p className={`name font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
              {destCountry?.name ?? simulation.destination}
            </p>
            <p className={`sub text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Territoire douanier · Code {simulation.destination}
            </p>
            <div className={`cert-box mt-4 rounded-lg px-4 py-3 border text-xs font-mono ${
              darkMode ? "bg-dark-primary border-gray-800" : "bg-gray-50 border-gray-200"
            }`}>
              <div>Produit HS {simulation.hsCode}</div>
              <div className={`mt-1 leading-snug ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {simulation.productDescription}
              </div>
            </div>
          </div>
        </div>

        <div className={`cert-origin-report rounded-lg border px-5 py-4 mb-8 ${
          darkMode ? "bg-dark-primary/50 border-gray-800" : "bg-gray-50 border-gray-200"
        }`}>
          <p className={`cert-section-title mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Rapport de la règle d&apos;origine (AFT)
          </p>
          <div className={`row flex justify-between py-2 border-b text-sm font-mono ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }`}>
            <span>Valeur ajoutée locale</span>
            <span className="font-bold">{simulation.localOriginValueRatio}%</span>
          </div>
          <div className="row flex justify-between py-2 text-sm font-mono">
            <span>Seuil de conformité AfCFTA</span>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>≥ {originThreshold}%</span>
          </div>
        </div>

        <p className={`cert-section-title mb-3 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
          Structure de taxation
        </p>
        <div className={`rounded-lg overflow-hidden border mb-8 ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}>
          <table className="cert-table w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={thClass}>Nature de la taxe</th>
                <th className={`${thClass} text-right`}>Taux appliqué</th>
                <th className={`${thClass} text-right`}>Montant ({destCountry?.currency ?? "—"})</th>
              </tr>
            </thead>
            <tbody>
              <tr className={darkMode ? "border-gray-800" : "border-gray-100"}>
                <td className={tdClass}>Droits de douane</td>
                <td className={tdNum}>
                  {simulation.isEligiblePrefAfCFTA ? (
                    <>
                      {(simulation.appliedTariffRate * 100).toFixed(1)}%
                      <span className={`text-[10px] line-through ml-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {(simulation.baseTariffRate * 100).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    `${(simulation.baseTariffRate * 100).toFixed(1)}%`
                  )}
                </td>
                <td className={tdNum}>{formatAmount(simulation.dutyPaidLocal, destCountry?.currency)}</td>
              </tr>
              <tr>
                <td className={tdClass}>TVA locale</td>
                <td className={tdNum}>{vatPct.toFixed(2)}%</td>
                <td className={tdNum}>{formatAmount(simulation.vatPaidLocal, destCountry?.currency)}</td>
              </tr>
              <tr className={`total ${darkMode ? "bg-dark-primary/80" : "bg-gray-50"}`}>
                <td className={`${tdClass} font-bold`} colSpan={2}>
                  TOTAL DES TAXES
                  <span className={`total-usd block text-[11px] font-normal mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Équivalent ≈ {formatAmount(simulation.totalTaxUSD, "USD")}
                  </span>
                </td>
                <td className={`${tdNum} font-bold text-base text-primary-500 total-xaf`}>
                  {formatAmount(simulation.totalTaxLocal, destCountry?.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className={`cert-footer flex flex-wrap justify-between gap-4 pt-6 border-t border-dashed text-[10px] font-mono ${
            darkMode ? "border-gray-800 text-gray-500" : "border-gray-300 text-gray-500"
          }`}
        >
          <div>
            <div>Document généré par RegTech — Assistant douanier AfCFTA</div>
            <div className="mt-1">Généré le {new Date(simulation.date).toLocaleString("fr-FR")}</div>
          </div>
          <div className="text-right">
            <div className="font-bold">RegTech</div>
            <div>Certificat pro-forma d&apos;éligibilité</div>
          </div>
        </div>
      </div>
    </div>
  );
};

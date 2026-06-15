/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { FileDown, Printer, ShieldAlert, BadgeCheck, FileText } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";

interface DeclarationSummaryProps {
  simulation: SimulationResult;
  darkMode?: boolean;
}

export const DeclarationSummary: React.FC<DeclarationSummaryProps> = ({ 
  simulation,
  darkMode = true
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { countries } = useReferenceData();

  const originCountry = countries.find((c) => c.code === simulation.origin);
  const destCountry = countries.find((c) => c.code === simulation.destination);
  const originThreshold = simulation.originValueThresholdPct ?? 40;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;

    if (printContent) {
      const windowPrint = window.open("", "_blank");
      if (windowPrint) {
        windowPrint.document.write(`
          <html>
            <head>
              <title>Declaration ZLECAf - ${simulation.id}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@4.1.14/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { 
                  font-family: 'Inter', sans-serif; 
                  background-color: white; 
                  color: black; 
                  padding: 24px; 
                }
              </style>
            </head>
            <body onload="window.print();window.close()">
              <div class="max-w-3xl mx-auto border border-gray-300 p-8 rounded">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        windowPrint.document.close();
      }
    }
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
Valeur Déclarée    : ${simulation.declaredValueLocal.toLocaleString()} ${originCountry?.currency} (${simulation.declaredValueUSD.toLocaleString()} USD)
Valeur Ajoutée Loc. : ${simulation.localOriginValueRatio}% (Requis: >= ${simulation.originValueThresholdPct ?? 40}%)
Éligible ZLECAf     : ${simulation.isEligiblePrefAfCFTA ? "OUI (Traitement Préférentiel Certifié)" : "NON (Exclus ou Non Conforme)"}

PARTIE DESTINATAIRE / DOUANE:
Pays de Destination : ${destCountry?.name} (${simulation.destination})
Désignation Produit : ${simulation.productDescription}
Nomenclature HS-Code: ${simulation.hsCode}
Sensible Excl.      : ${simulation.sensitiveExclusion ? "OUI (Sujet à des quotas ou exclusions)" : "NON"}

TAUX & CALCULS DE TAXES:
Taux de Droit Base  : ${(simulation.baseTariffRate * 100).toFixed(1)}%
Taux Préférentiel   : ${(simulation.appliedTariffRate * 100).toFixed(1)}%
Droit de Douane Payé: ${simulation.dutyPaidLocal.toLocaleString()} ${destCountry?.currency} (${simulation.dutyPaidUSD.toLocaleString()} USD)
TVA Applicable      : ${destCountry ? (destCountry.vatRate * 100).toFixed(1) : 0}%
Montant TVA Payé    : ${simulation.vatPaidLocal.toLocaleString()} ${destCountry?.currency} (${simulation.vatPaidUSD.toLocaleString()} USD)
------------------------------------------------------------------------
TOTAL ESTIMATE TAX  : ${simulation.totalTaxLocal.toLocaleString()} ${destCountry?.currency} (${simulation.totalTaxUSD.toLocaleString()} USD)
========================================================================
Document généré par RegTech — Assistant douanier AfCFTA
Référence simulation   : ${simulation.id}
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

  return (
    <div className={`border rounded-lg overflow-hidden mt-6 transition-all duration-300 font-sans ${
      darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-202 shadow-sm"
    }`} id="summary_receipt_panel">
      {/* Header Panel */}
      <div className={`p-4 border-b flex items-center justify-between transition-colors ${
        darkMode ? "bg-dark-secondary border-gray-800" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500 animate-pulse" />
          <div>
            <h3 className={`text-sm font-bold font-display ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}>Bordereau de Simulation Douanière</h3>
            <p className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500 font-semibold"}`}>ID: {simulation.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadTextReceipt}
            id="btn_download_receipt"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded transition-colors font-medium cursor-pointer ${
              darkMode ? "bg-dark-secondary text-gray-300 hover:bg-gray-700 border-gray-700" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm"
            }`}
            title="Exporter en fichier texte"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>TXT Exporter</span>
          </button>
          <button
            onClick={handlePrint}
            id="btn_print_receipt"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary-600 hover:bg-primary-600 text-white rounded font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Sheet Content to Print */}
      <div id="printable_summary_content" ref={printRef} className={`p-6 transition-colors duration-300 ${
        darkMode ? "bg-[#101828] text-gray-200" : "bg-white text-gray-800 border-t border-gray-100"
      }`}>
        {/* Document Header */}
        <div className={`text-center border-b border-dashed pb-4 mb-4 ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}>
          <div className="text-primary-600 dark:text-primary-500 font-extrabold uppercase tracking-widest text-xs font-display">
            Régime Préférentiel Douanier AfCFTA / ZLECAf
          </div>
          <h1 className={`text-lg font-black font-display mt-1 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>CERTIFICAT PRO-FORMA D'ÉLIGIBILITÉ</h1>
          <p className={`text-[10px] mt-1 uppercase font-mono ${
            darkMode ? "text-gray-400" : "text-gray-500 font-semibold"
          }`}>
            Réf. {simulation.id} · {new Date(simulation.date).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Eligibility Status Banner */}
        <div className="mb-4">
          {simulation.isEligiblePrefAfCFTA ? (
            <div className={`border p-3 rounded-lg flex items-start gap-2.5 ${
              darkMode ? "bg-primary-950/40 border-primary-500/30 text-primary-300" : "bg-primary-50 border-primary-200 text-primary-900"
            }`}>
              <BadgeCheck className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-extrabold">TRAITEMENT PRÉFÉRENTIEL COMPATIBLE</strong>
                <p className="text-[11px] mt-0.5 leading-relaxed font-semibold">
                  La règle d'origine ({originThreshold}% valeur ajoutée locale) est <strong>vérifiée ({simulation.localOriginValueRatio}%)</strong>. Les droits de douane standard font l'objet d'un abattement tarifaire de l'année {simulation.year}.
                </p>
              </div>
            </div>
          ) : (
            <div className={`border p-3 rounded-lg flex items-start gap-2.5 ${
              darkMode ? "bg-rose-950/40 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-250 text-rose-900"
            }`}>
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-extrabold">RÉGIME DOUANIER STANDARD APPLIQUÉ</strong>
                <p className="text-[11px] mt-0.5 leading-relaxed font-semibold">
                  {simulation.sensitiveExclusion 
                    ? "Produit catalogué comme 'Sensible ou Exclu' de l'accord." 
                    : `Critère de valeur ajoutée locale insuffisant (${simulation.localOriginValueRatio}% / seuil requis : ${originThreshold}%).`} Les droits sont perçus au plein tarif.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section Matrix Grid */}
        <div className={`grid grid-cols-2 gap-6 pb-4 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}>Origine & Expéditeur</span>
            <div className="mt-1 flex items-center gap-2">
              <div>
                <span className={`font-bold text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{originCountry?.name ?? simulation.origin}</span>
                <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500 font-medium"}`}>Exportateur AfCFTA • Code: {simulation.origin}</p>
              </div>
            </div>
            <div className={`mt-3 text-xs px-2 py-1.5 rounded font-mono border ${
              darkMode ? "bg-dark-primary border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700 font-semibold"
            }`}>
              Valeur déclarée: {simulation.declaredValueLocal.toLocaleString()} {originCountry?.currency}
              <div className={`text-[10px] mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>≈ {simulation.declaredValueUSD.toLocaleString()} USD</div>
            </div>
          </div>

          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}>Destination & Douane</span>
            <div className="mt-1 flex items-center gap-2">
              <div>
                <span className={`font-bold text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{destCountry?.name ?? simulation.destination}</span>
                <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500 font-medium"}`}>Territoire douanier • Code: {simulation.destination}</p>
              </div>
            </div>
            <div className={`mt-3 text-xs px-2 py-1.5 rounded font-mono border ${
              darkMode ? "bg-dark-primary border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700 font-semibold"
            }`}>
              Produit: {simulation.hsCode}
              <div className={`text-[10px] mt-0.5 truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`} title={simulation.productDescription}>{simulation.productDescription}</div>
            </div>
          </div>
        </div>

        {/* Math & Rule Breakdown */}
        <div className={`mt-4 border p-3 rounded-lg text-xs leading-relaxed ${
          darkMode ? "bg-dark-primary/40 border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
        }`}>
          <strong className={`text-xs block mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>Rapport de la Règle d'Origine (AFT)</strong>
          <div className={`flex justify-between font-mono py-1 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
            <span>Rapport Valeur Ajoutée Locale:</span>
            <span className={`font-bold ${darkMode ? "text-white" : "text-primary-700"}`}>{simulation.localOriginValueRatio}%</span>
          </div>
          <div className="flex justify-between font-mono py-1">
            <span>Seuil Limite de Conformité AfCFTA:</span>
            <span className={`font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>&ge; {originThreshold} %</span>
          </div>
        </div>

        {/* Detailed Tariffs Calculation Table */}
        <div className="mt-5">
          <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}>Structure de taxation</span>
          <div className={`w-full rounded-lg overflow-hidden border text-xs transition-colors ${
            darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <div className={`grid grid-cols-3 px-3 py-2 font-semibold ${
              darkMode ? "bg-dark-secondary text-gray-400" : "bg-gray-100 text-gray-600 border-b border-gray-200"
            }`}>
              <span>Nature de la Taxe</span>
              <span className="text-right">Taux appliqué</span>
              <span className="text-right">Montant ({destCountry?.currency})</span>
            </div>
            
            <div className={`grid grid-cols-3 px-3 py-2.5 border-b ${
              darkMode ? "border-gray-800/60" : "border-gray-100"
            }`}>
              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Droits de douane</span>
              <span className="text-right font-mono font-bold">
                {simulation.isEligiblePrefAfCFTA ? (
                  <span className="text-primary-600 dark:text-primary-400">
                    {(simulation.appliedTariffRate * 100).toFixed(1)}% <span className={`text-[9px] line-through ml-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{(simulation.baseTariffRate * 100).toFixed(1)}%</span>
                  </span>
                ) : (
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{(simulation.baseTariffRate * 100).toFixed(1)}%</span>
                )}
              </span>
              <span className={`text-right font-mono font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                {simulation.dutyPaidLocal.toLocaleString()} {destCountry?.currency}
              </span>
            </div>

            <div className={`grid grid-cols-3 px-3 py-2.5 border-b ${
              darkMode ? "border-gray-800/60" : "border-gray-100"
            }`}>
              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>TVA locale</span>
              <span className={`text-right font-mono font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{(destCountry ? destCountry.vatRate * 100 : 0).toFixed(2)}%</span>
              <span className={`text-right font-mono font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                {simulation.vatPaidLocal.toLocaleString()} {destCountry?.currency}
              </span>
            </div>

            <div className={`grid grid-cols-3 px-3 py-3 font-bold ${
              darkMode ? "bg-dark-primary/80 text-white" : "bg-gray-50 text-gray-900 border-t border-gray-200"
            }`}>
              <span>TOTAL DES TAXES</span>
              <span className={`text-right text-[10px] font-normal font-mono ${darkMode ? "text-gray-400" : "text-gray-600 font-semibold"}`}>≈ ${simulation.totalTaxUSD.toLocaleString()} USD</span>
              <span className="text-right text-primary-600 dark:text-primary-400 font-mono text-sm leading-none font-bold">
                {simulation.totalTaxLocal.toLocaleString()} {destCountry?.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Audit validation block */}
        <div className={`mt-6 pt-4 border-t border-dashed flex justify-between items-center text-[10px] font-mono font-semibold ${
          darkMode ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-500"
        }`}>
          <div>
            <div>Document généré par RegTech — Assistant douanier AfCFTA</div>
            <div>Généré le: {new Date(simulation.date).toLocaleString("fr-FR")}</div>
          </div>
          <div className="text-right">
            <div className={darkMode ? "text-gray-400 font-bold" : "text-gray-700 font-bold"}>RegTech</div>
            <div className="font-medium">Certificat pro-forma d&apos;éligibilité</div>
          </div>
        </div>
      </div>
    </div>
  );
};

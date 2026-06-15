/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import {
  ChevronRight,
  FileText,
  CheckCircle2,
  Download,
  Table,
  AlertCircle,
  Play,
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  regtechApi,
  type BatchRowResult,
  type BatchSummary,
} from "@/infrastructure/http/regtechApi";
import { ApiError } from "@/infrastructure/http/apiClient";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import {
  fileToCsvText,
  validateBatchCsvContent,
} from "@/presentation/features/export/spreadsheetImport";
import {
  fxSourceLabel,
  parseBatchCsvContent,
} from "@/presentation/features/export/batchCsvParser";
import { downloadBatchExcelTemplate } from "@/presentation/features/export/batchExcelTemplate";
import { BATCH_HEADERS_CSV } from "@/presentation/features/export/batchColumnDefs";

interface BatchLoaderProps {
  darkMode?: boolean;
  onUpgrade?: () => void;
}

export const BatchLoader: React.FC<BatchLoaderProps> = ({ darkMode = true, onUpgrade }) => {
  const { canUse, recordUsage } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [importedFileName, setImportedFileName] = useState<string>("");
  const [results, setResults] = useState<BatchRowResult[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setErrorMsg("");
    try {
      await downloadBatchExcelTemplate();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Impossible de générer le modèle Excel.",
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const runBatch = async (content: string) => {
    setIsProcessing(true);
    setErrorMsg("");
    setResults([]);
    setSummary(null);

    try {
      validateBatchCsvContent(content);
      const rowsToProcess = parseBatchCsvContent(content);
      if (rowsToProcess.length === 0) {
        throw new Error("Aucune ligne valide (valeur declaree et prix export requis).");
      }

      if (!canUse("batchRows", rowsToProcess.length)) {
        throw new Error(
          `Quota lot dépassé (${rowsToProcess.length} lignes). Réduisez le fichier ou passez à un plan supérieur.`,
        );
      }

      const data = await regtechApi.batch({ rows: rowsToProcess });
      setResults(data.results);
      setSummary(data.summary);
      recordUsage("batchRows", rowsToProcess.length);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 402
            ? "Quota atteint — consultez l'onglet Offres."
            : err.message
          : err instanceof Error
            ? err.message
            : "Erreur de decodage des lignes CSV.";
      setErrorMsg(msg);
      if (err instanceof ApiError && err.status === 402) onUpgrade?.();
      if (err instanceof Error && err.message.includes("Quota lot")) onUpgrade?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const ingestFile = async (file: File) => {
    setIsImporting(true);
    setErrorMsg("");
    try {
      const text = validateBatchCsvContent(await fileToCsvText(file));
      setCsvText(text);
      setImportedFileName(file.name);
      await runBatch(text);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Impossible de lire le fichier.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await ingestFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await ingestFile(file);
  };

  return (
    <div
      className={`border rounded-lg p-6 transition-colors duration-300 font-sans ${
        darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
      }`}
      id="bulk_customs_panel"
    >
      <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
        darkMode ? "border-gray-800" : "border-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-purple-500 animate-pulse" />
          <div>
            <h2 className={`text-base font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
              Simulation de Lot (CSV / Excel)
            </h2>
            <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              ZIP : modèle à remplir + guide · Import = calcul automatique de toutes les lignes
            </p>
          </div>
        </div>

        <button
          onClick={() => void handleDownloadTemplate()}
          id="btn_download_template"
          disabled={isDownloadingTemplate}
          className="text-xs text-primary-600 hover:text-primary-500 flex items-center gap-1 hover:underline cursor-pointer font-semibold disabled:opacity-50"
        >
          {isDownloadingTemplate ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isDownloadingTemplate ? "Génération…" : "Télécharger modèle + guide (ZIP)"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
              dragOver
                ? darkMode
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-purple-500 bg-purple-50"
                : darkMode
                  ? "border-gray-700 hover:border-gray-500 bg-[#101828]/50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <Upload
              className={`w-8 h-8 mx-auto mb-2 ${
                isImporting || isProcessing ? "animate-pulse text-purple-400" : "text-purple-500"
              }`}
            />
            <p className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              Importer CSV ou Excel
            </p>
            <p className={`text-[11px] mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Calcul lance automatiquement apres import
            </p>
            {importedFileName && (
              <p className={`text-[10px] mt-2 font-mono ${darkMode ? "text-primary-400" : "text-primary-700"}`}>
                Fichier : {importedFileName}
              </p>
            )}
          </div>

          <div>
            <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 flex justify-between items-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              <span>Apercu / collage manuel</span>
              <span className={`text-[10px] font-semibold ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Separateur virgule
              </span>
            </label>
            <textarea
              id="txt_raw_csv_paste"
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className={`w-full rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-purple-550 transition-colors ${
                darkMode ? "bg-[#101828] border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
              placeholder={`${BATCH_HEADERS_CSV}\nCMR,NGA,851712,1000000,...`}
            />
          </div>

          <button
            onClick={() => void runBatch(csvText)}
            id="btn_run_csv_processing"
            disabled={isProcessing || !csvText.trim()}
            className="w-full bg-purple-650 hover:bg-purple-600 disabled:opacity-40 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isProcessing ? "Calcul en cours..." : "Recalculer le lot"}</span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="xl:col-span-7">
          <div className={`border rounded-lg p-4 h-full flex flex-col transition-colors ${
            darkMode ? "bg-[#101828]/50 border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800"
          }`}>
            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Calcul taxes + conversion devises (Frankfurter) pour chaque ligne...
                </span>
              </div>
            ) : results.length > 0 && summary ? (
              <div className="space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Rapport de lot • {summary.processedCount} lignes
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-600"
                  }`}>
                    FX : {fxSourceLabel(summary.exchangeRateSource)}
                  </span>
                </div>

                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className={`rounded-lg border p-2 ${darkMode ? "border-gray-800 bg-dark-primary" : "border-gray-200 bg-white"}`}>
                    <div className="text-gray-500">Succes</div>
                    <div className="text-lg font-bold text-primary-500">{summary.successCount}</div>
                  </div>
                  <div className={`rounded-lg border p-2 ${darkMode ? "border-gray-800 bg-dark-primary" : "border-gray-200 bg-white"}`}>
                    <div className="text-gray-500">Erreurs</div>
                    <div className="text-lg font-bold text-rose-500">{summary.errorCount}</div>
                  </div>
                  <div className={`rounded-lg border p-2 col-span-2 ${darkMode ? "border-gray-800 bg-dark-primary" : "border-gray-200 bg-white"}`}>
                    <div className="text-gray-500">Total taxes (USD)</div>
                    <div className="text-lg font-bold">{summary.totalTaxUSD.toLocaleString()} USD</div>
                  </div>
                </div>

                <div className={`overflow-x-auto border rounded-lg ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}>
                  <table className="w-full text-xs text-left min-w-[720px]" id="table_bulk_results">
                    <thead className={`font-semibold uppercase text-[10px] tracking-wider border-b ${
                      darkMode ? "bg-dark-primary border-gray-800 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}>
                      <tr>
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Trajet</th>
                        <th className="px-2 py-2">Produit</th>
                        <th className="px-2 py-2 text-center">ZLECAf</th>
                        <th className="px-2 py-2 text-right">Douane</th>
                        <th className="px-2 py-2 text-right">TVA</th>
                        <th className="px-2 py-2 text-right">Total</th>
                        <th className="px-2 py-2 text-right">USD</th>
                        <th className="px-2 py-2">FX</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono ${darkMode ? "divide-gray-800/60" : "divide-gray-200"}`}>
                      {results.map((r) => (
                        <tr
                          key={r.rowId}
                          className={`transition-colors ${
                            r.hasError
                              ? darkMode
                                ? "bg-rose-950/20 text-rose-300"
                                : "bg-rose-50 text-rose-900"
                              : darkMode
                                ? "hover:bg-dark-primary/40 text-gray-300"
                                : "hover:bg-gray-100/50 text-gray-800"
                          }`}
                        >
                          <td className="px-2 py-2 text-gray-500">{r.rowId}</td>
                          <td className="px-2 py-2 font-bold whitespace-nowrap">
                            {r.origin}
                            <ChevronRight className="w-3 h-3 text-primary-500 inline-block align-middle mx-0.5" />
                            {r.destination}
                            <span className="block text-[9px] text-gray-500 font-normal">{r.year}</span>
                          </td>
                          <td className="px-2 py-2">
                            <span className={`font-bold block ${darkMode ? "text-white" : "text-gray-900"}`}>{r.hsCode}</span>
                            <span className="text-[9px] truncate block max-w-[120px] text-gray-500">{r.productDescription}</span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            {!r.hasError && (
                              <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold border ${
                                r.isEligiblePrefAfCFTA
                                  ? "bg-primary-500/10 text-primary-600 border-primary-500/20"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              }`}>
                                {r.isEligiblePrefAfCFTA ? "OUI" : "NON"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            {r.hasError ? "—" : `${r.dutyPaidLocal.toLocaleString()} ${r.currency}`}
                          </td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            {r.hasError ? "—" : `${r.vatPaidLocal.toLocaleString()} ${r.currency}`}
                          </td>
                          <td className={`px-2 py-2 text-right font-bold whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {r.hasError ? "—" : `${r.totalTaxLocal.toLocaleString()} ${r.currency}`}
                          </td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            {r.hasError ? "—" : `${r.totalTaxUSD.toLocaleString()} USD`}
                          </td>
                          <td className="px-2 py-2 text-[9px] text-gray-500">
                            {r.hasError ? "—" : (
                              <>
                                <span className="block">1$={r.originExchangeRateToUSD}→</span>
                                <span className="block">{r.destinationExchangeRateToUSD}</span>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`border p-3 rounded-lg text-[11px] leading-relaxed flex items-start gap-1.5 ${
                  darkMode ? "bg-purple-950/20 text-purple-300 border-purple-500/10" : "bg-purple-50 text-purple-900 border-purple-150"
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lot calcule :</strong> {summary.successCount} simulation(s) avec droits, TVA et conversion
                    via {fxSourceLabel(summary.exchangeRateSource)}. Total consolidé :{" "}
                    <strong>{summary.totalTaxUSD.toLocaleString()} USD</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-500 text-center">
                <FileText className="w-8 h-8 text-gray-405 mb-2" />
                <p className="text-xs font-semibold">Aucune simulation de lot.</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Importez un CSV — le calcul demarre automatiquement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

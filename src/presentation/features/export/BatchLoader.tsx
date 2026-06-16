/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import {
  ChevronRight,
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
import { platform } from "@/presentation/theme/platformStyles";
import {
  fileToCsvText,
  parseSpreadsheetText,
  validateBatchCsvContent,
} from "@/presentation/features/export/spreadsheetImport";
import {
  fxSourceLabel,
  parseBatchCsvContent,
} from "@/presentation/features/export/batchCsvParser";
import {
  downloadBatchGuideFile,
  downloadBatchTemplateFile,
} from "@/presentation/features/export/batchExcelTemplate";
import { BatchPreviewTable } from "@/presentation/features/export/BatchPreviewTable";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";

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
  const [isDownloadingGuide, setIsDownloadingGuide] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setErrorMsg("");
    try {
      await downloadBatchTemplateFile();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to generate the Excel template.",
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleDownloadGuide = async () => {
    setIsDownloadingGuide(true);
    setErrorMsg("");
    try {
      await downloadBatchGuideFile();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to generate the user guide.",
      );
    } finally {
      setIsDownloadingGuide(false);
    }
  };

  const normalizeBatchContent = (content: string) => {
    const normalized = parseSpreadsheetText(content);
    return validateBatchCsvContent(normalized);
  };

  const runBatch = async (content: string) => {
    setIsProcessing(true);
    setErrorMsg("");
    setResults([]);
    setSummary(null);

    try {
      const normalized = parseSpreadsheetText(content);
      validateBatchCsvContent(normalized);
      const rowsToProcess = parseBatchCsvContent(normalized);
      if (rowsToProcess.length === 0) {
        throw new Error("No valid rows (declared value and export price are required).");
      }

      if (!canUse("batchRows", rowsToProcess.length)) {
        throw new Error(
          `Batch quota exceeded (${rowsToProcess.length} rows). Reduce the file or upgrade to a higher plan.`,
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
            ? "Quota reached — see the Offers tab."
            : err.message
          : err instanceof Error
            ? err.message
            : "CSV line decoding error.";
      setErrorMsg(msg);
      if (err instanceof ApiError && err.status === 402) onUpgrade?.();
      if (err instanceof Error && err.message.toLowerCase().includes("quota")) onUpgrade?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const ingestFile = async (file: File) => {
    setIsImporting(true);
    setErrorMsg("");
    try {
      const text = normalizeBatchContent(await fileToCsvText(file));
      setCsvText(text);
      setImportedFileName(file.name);
      await runBatch(text);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to read the file.",
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
    <div className="space-y-6 font-sans transition-colors duration-300" id="bulk_customs_panel">
      <SectionPanel darkMode={darkMode} id="batch_import_panel">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Table className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
            <div>
              <h2 className={`text-base font-bold font-display ${platform.textPrimary(darkMode)}`}>
                Batch simulation (CSV / Excel)
              </h2>
              <p className={`mt-1 text-sm ${platform.textMuted(darkMode)}`}>
                Download the template and guide separately · import triggers automatic calculation
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              onClick={() => void handleDownloadTemplate()}
              id="btn_download_template"
              disabled={isDownloadingTemplate}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
            >
              {isDownloadingTemplate ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingTemplate ? "Generating…" : "Download template"}</span>
            </button>
            <button
              onClick={() => void handleDownloadGuide()}
              id="btn_download_guide"
              disabled={isDownloadingGuide}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
            >
              {isDownloadingGuide ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingGuide ? "Generating…" : "Download guide"}</span>
            </button>
          </div>
        </div>

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
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
            dragOver
              ? darkMode
                ? "border-primary-500 bg-primary-500/10"
                : "border-primary-400 bg-primary-50"
              : darkMode
                ? "border-gray-700 hover:border-primary-500/40 hover:bg-white/5"
                : "border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 bg-gray-50/50"
          }`}
        >
          <Upload
            className={`mx-auto mb-3 h-10 w-10 ${
              isImporting || isProcessing ? "animate-pulse text-primary-400" : "text-primary-500"
            }`}
          />
          <p className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>Import CSV or Excel</p>
          <p className={`mt-1 text-sm ${platform.textMuted(darkMode)}`}>
            Calculation starts automatically after import
          </p>
          {importedFileName && (
            <p className={`mt-2 font-mono text-xs text-primary-500`}>File: {importedFileName}</p>
          )}
        </div>
      </SectionPanel>

      <SectionPanel darkMode={darkMode} id="batch_preview_panel">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>Data preview</h2>
            <p className={`mt-1 text-sm ${platform.textMuted(darkMode)}`}>
              Review imported rows before recalculating
            </p>
          </div>
          <span className={`text-xs ${platform.textMuted(darkMode)}`}>Comma-separated values</span>
        </div>

        <BatchPreviewTable csvText={csvText} darkMode={darkMode} />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                  const normalized = normalizeBatchContent(text);
                  setCsvText(normalized);
                  setErrorMsg("");
                }
              } catch (err) {
                setErrorMsg(
                  err instanceof Error
                    ? err.message
                    : "Unable to read clipboard. Paste your CSV into a file and import it.",
                );
              }
            }}
            className={`sm:w-auto w-full ${platform.buttonSecondary(darkMode)} text-sm py-2.5`}
          >
            Paste from clipboard
          </button>
          <button
            onClick={() => void runBatch(csvText)}
            id="btn_run_csv_processing"
            disabled={isProcessing || !csvText.trim()}
            className={`flex-1 ${platform.buttonGradient} text-sm py-2.5`}
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isProcessing ? "Processing…" : "Recalculate batch"}</span>
          </button>
        </div>

        {errorMsg && (
          <p className="mt-4 flex items-center gap-2 text-sm text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </p>
        )}
      </SectionPanel>

      {(isProcessing || results.length > 0) && (
        <SectionPanel darkMode={darkMode} id="batch_results_panel">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <RefreshCw className="w-6 h-6 text-primary-500 animate-spin" />
                <span className={`text-sm ${platform.textMuted(darkMode)}`}>
                  Calculating taxes and FX conversions for each row…
                </span>
              </div>
            ) : results.length > 0 && summary ? (
              <div className="space-y-4 font-sans">
                <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>Batch results</h2>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${platform.textMuted(darkMode)}`}>
                    Report · {summary.processedCount} rows
                  </span>
                  <span className={`text-xs font-mono rounded-full border px-2.5 py-0.5 ${platform.border(darkMode)} ${platform.textMuted(darkMode)}`}>
                    FX: {fxSourceLabel(summary.exchangeRateSource)}
                  </span>
                </div>

                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm ${
                  platform.textSecondary(darkMode)
                }`}>
                  <div className={`rounded-xl border p-3 ${platform.border(darkMode)}`}>
                    <div className={platform.textMuted(darkMode)}>Success</div>
                    <div className="text-lg font-bold text-primary-500">{summary.successCount}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${platform.border(darkMode)}`}>
                    <div className={platform.textMuted(darkMode)}>Errors</div>
                    <div className="text-lg font-bold text-rose-500">{summary.errorCount}</div>
                  </div>
                  <div className={`rounded-xl border p-3 col-span-2 ${platform.border(darkMode)}`}>
                    <div className={platform.textMuted(darkMode)}>Total taxes (USD)</div>
                    <div className="text-lg font-bold">{summary.totalTaxUSD.toLocaleString()} USD</div>
                  </div>
                </div>

                <div className={`overflow-x-auto rounded-xl border ${platform.border(darkMode)}`}>
                  <table className="w-full text-xs text-left min-w-[720px]" id="table_bulk_results">
                    <thead className={`font-semibold uppercase text-[10px] tracking-wider border-b ${
                      darkMode ? "bg-dark-primary border-gray-800 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}>
                      <tr>
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Route</th>
                        <th className="px-2 py-2">Product</th>
                        <th className="px-2 py-2 text-center">AfCFTA</th>
                        <th className="px-2 py-2 text-right">Duties</th>
                        <th className="px-2 py-2 text-right">VAT</th>
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
                                {r.isEligiblePrefAfCFTA ? "YES" : "NO"}
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

                <p className={`text-sm leading-relaxed ${platform.textSecondary(darkMode)}`}>
                  <CheckCircle2 className="mb-0.5 mr-1 inline h-4 w-4 text-primary-500" />
                  <strong>Batch complete:</strong> {summary.successCount} simulation(s) with duties, VAT, and FX via{" "}
                  {fxSourceLabel(summary.exchangeRateSource)}. Consolidated total:{" "}
                  <strong>{summary.totalTaxUSD.toLocaleString()} USD</strong>.
                </p>
              </div>
            ) : null}
        </SectionPanel>
      )}
    </div>
  );
};

/**
 * Parse CSV batch content into simulation rows.
 */

import type { BatchRowInput } from "@/infrastructure/http/regtechApi";
import { resolveBatchHeader } from "@/presentation/features/export/batchColumnDefs";
import { parseBatchNumber, parseCsvLine } from "@/presentation/features/export/batchCsvUtils";

export function parseBatchCsvContent(content: string): BatchRowInput[] {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const rows: BatchRowInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length === 0) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      const key = resolveBatchHeader(header) ?? header;
      rowObj[key] = parts[idx] ?? "";
    });

    const declaredValueLocal = parseBatchNumber(rowObj.declaredValueLocal);
    const prixVenteExport = parseBatchNumber(
      rowObj.prixVenteExport || rowObj.declaredValueLocal,
    );

    rows.push({
      origin: (rowObj.origin || "CMR").toUpperCase(),
      destination: (rowObj.destination || "NGA").toUpperCase(),
      hsCode: String(rowObj.hsCode || "851712").replace(/\D/g, "") || "851712",
      declaredValueLocal,
      costMatiereLocale: parseBatchNumber(rowObj.costMatiereLocale),
      mainOeuvreLocale: parseBatchNumber(rowObj.mainOeuvreLocale),
      fraisLocaux: parseBatchNumber(rowObj.fraisLocaux),
      prixVenteExport,
      year: parseBatchNumber(rowObj.year) || 2026,
    });
  }

  return rows.filter((row) => row.declaredValueLocal > 0 && row.prixVenteExport > 0);
}

export function fxSourceLabel(source: string): string {
  if (source === "frankfurter") return "Frankfurter (ECB, free)";
  if (source === "pilot") return "AfCFTA pilot reference";
  return "Country reference";
}

/**
 * Parse CSV text or Excel (.xlsx, .xls) into normalized CSV for batch simulation.
 */

import {
  BATCH_HEADERS_CSV,
  gridToNormalizedCsv,
} from "@/presentation/features/export/batchColumnDefs";
import { parseCsvLine } from "@/presentation/features/export/batchCsvUtils";

export async function fileToCsvText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    return normalizeCsvText(await file.text());
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const sheetName =
      workbook.SheetNames.find((n) => n.toLowerCase() === "simulations") ??
      workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("Le fichier Excel ne contient aucune feuille.");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    }) as (string | number)[][];

    return gridToNormalizedCsv(rows);
  }

  throw new Error("Format non supporté. Utilisez .csv, .xlsx ou .xls");
}

function normalizeCsvText(content: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error(
      "Le fichier doit contenir au moins une ligne d'en-tête et une ligne de données.",
    );
  }

  const rows = lines.map((line) => parseCsvLine(line));
  return gridToNormalizedCsv(rows);
}

export function validateBatchCsvContent(content: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error(
      "Le fichier doit contenir au moins une ligne d'en-tête et une ligne de données.",
    );
  }
  return content;
}

export { BATCH_HEADERS_CSV as BATCH_HEADERS };

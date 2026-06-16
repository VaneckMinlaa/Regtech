/**
 * Parse CSV text or Excel (.xlsx, .xls) into normalized CSV for batch simulation.
 */

import {
  BATCH_HEADERS_CSV,
  gridToNormalizedCsv,
  resolveBatchHeader,
} from "@/presentation/features/export/batchColumnDefs";
import { parseCsvLine } from "@/presentation/features/export/batchCsvUtils";

function textToGrid(text: string): (string | number)[][] {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  return normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseCsvLine(line));
}

function sanitizeSpreadsheetRows(rows: (string | number)[][]): (string | number)[][] {
  return rows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return "";
      if (typeof cell === "string") return cell.replace(/^\uFEFF/, "").trim();
      return cell;
    }),
  );
}

function isNormalizedCsv(content: string): boolean {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  const headers = parseCsvLine(lines[0]);
  const resolved = headers.filter((h) => resolveBatchHeader(h) !== null).length;
  return resolved >= 5;
}

/** Normalize pasted CSV/TSV or raw grid text into technical-column CSV. */
export function parseSpreadsheetText(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Paste or import a CSV/Excel file with at least one data row.");
  }
  if (isNormalizedCsv(trimmed)) {
    return trimmed;
  }
  return gridToNormalizedCsv(textToGrid(trimmed));
}

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
      throw new Error("The Excel file contains no worksheets.");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
      blankrows: true,
    }) as (string | number)[][];

    return gridToNormalizedCsv(sanitizeSpreadsheetRows(rows));
  }

  throw new Error("Unsupported format. Use .csv, .xlsx, or .xls");
}

function normalizeCsvText(content: string): string {
  return parseSpreadsheetText(content);
}

export function validateBatchCsvContent(content: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error(
      "The file must contain at least one header row and one data row.",
    );
  }
  return content;
}

export { BATCH_HEADERS_CSV as BATCH_HEADERS };

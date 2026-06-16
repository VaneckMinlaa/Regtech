/**
 * Utilitaires de parsing CSV / nombres pour les imports par lot.
 */

export function detectCsvDelimiter(line: string): "," | ";" | "\t" {
  if (line.includes("\t")) return "\t";
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

export function parseDelimitedLine(line: string, delimiter: "," | ";" | "\t"): string[] {
  if (delimiter === "\t") {
    return line.split("\t").map((field) => unquoteCsvField(field.trim()));
  }

  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(unquoteCsvField(current.trim()));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(unquoteCsvField(current.trim()));
  return result;
}

export function parseCsvLine(line: string): string[] {
  return parseDelimitedLine(line, detectCsvDelimiter(line));
}

function unquoteCsvField(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

/** Parse un montant ou entier (gère séparateurs milliers Excel : 1,000,000). */
export function parseBatchNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value)
    .trim()
    .replace(/[\s\u00A0]/g, "")
    .replace(/,/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseCsvToRows(content: string): string[][] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseCsvLine(line));
}

/**
 * Définition des colonnes du modèle de simulation par lot.
 */

import { parseBatchNumber } from "@/presentation/features/export/batchCsvUtils";

export interface BatchColumnDef {
  key: string;
  label: string;
  hint: string;
  width: number;
}

export const BATCH_COLUMNS: BatchColumnDef[] = [
  {
    key: "origin",
    label: "Origin country (ISO code)",
    hint: "3-letter ISO country code — e.g. CMR, NGA, GHA",
    width: 22,
  },
  {
    key: "destination",
    label: "Destination country (ISO code)",
    hint: "3-letter ISO country code — e.g. NGA, CIV, KEN",
    width: 26,
  },
  {
    key: "hsCode",
    label: "HS code",
    hint: "Harmonized customs code — e.g. 851712, 180100",
    width: 14,
  },
  {
    key: "declaredValueLocal",
    label: "Declared value (local currency)",
    hint: "Amount in the origin country’s local currency — > 0",
    width: 28,
  },
  {
    key: "costMatiereLocale",
    label: "Local raw material cost",
    hint: "Cost of local raw materials",
    width: 22,
  },
  {
    key: "mainOeuvreLocale",
    label: "Local labor cost",
    hint: "Cost of local labor",
    width: 20,
  },
  {
    key: "fraisLocaux",
    label: "Local fees/expenses",
    hint: "Local production/logistics fees",
    width: 16,
  },
  {
    key: "prixVenteExport",
    label: "Export sale price",
    hint: "Export sale price (if empty = declared value)",
    width: 22,
  },
  {
    key: "year",
    label: "Simulation year",
    hint: "Fiscal year — e.g. 2025 to 2030",
    width: 18,
  },
];

export const BATCH_SAMPLE_ROWS: (string | number)[][] = [
  ["CMR", "NGA", "851712", 1_000_000, 400_000, 150_000, 100_000, 1_000_000, 2026],
  ["NGA", "CIV", "180100", 5_000_000, 2_500_000, 500_000, 200_000, 4_000_000, 2027],
  ["GHA", "KEN", "090111", 2_000_000, 800_000, 300_000, 200_000, 2_000_000, 2026],
];

export const BATCH_HEADER_KEYS = BATCH_COLUMNS.map((c) => c.key);

export const BATCH_HEADERS_CSV = BATCH_HEADER_KEYS.join(",");

const NUMERIC_KEYS = new Set([
  "declaredValueLocal",
  "costMatiereLocale",
  "mainOeuvreLocale",
  "fraisLocaux",
  "prixVenteExport",
  "year",
]);

const LEGACY_HEADER_ALIASES: [string, string][] = [
  // Ancien modèle Excel (libellés FR)
  ["Pays origine (code ISO)", "origin"],
  ["Pays destination (code ISO)", "destination"],
  ["Code HS", "hsCode"],
  ["Code SH", "hsCode"],
  ["Valeur déclarée (devise locale)", "declaredValueLocal"],
  ["Coût matière locale", "costMatiereLocale"],
  ["Main-d'œuvre locale", "mainOeuvreLocale"],
  ["Main d'œuvre locale", "mainOeuvreLocale"],
  ["Frais locaux", "fraisLocaux"],
  ["Prix de vente export", "prixVenteExport"],
  ["Année de simulation", "year"],
  // Variantes anglaises / exports Excel
  ["Origin Country (ISO Code)", "origin"],
  ["Destination Country (ISO Code)", "destination"],
  ["HS Code", "hsCode"],
  ["Declared Value (Local Currency)", "declaredValueLocal"],
  ["Local Raw Material Cost", "costMatiereLocale"],
  ["Local Labor Cost", "mainOeuvreLocale"],
  ["Local Fees/Expenses", "fraisLocaux"],
  ["Export Sale Price", "prixVenteExport"],
  ["Simulation Year", "year"],
  // Clés snake_case
  ["declared_value_local", "declaredValueLocal"],
  ["cost_matiere_locale", "costMatiereLocale"],
  ["main_oeuvre_locale", "mainOeuvreLocale"],
  ["frais_locaux", "fraisLocaux"],
  ["prix_vente_export", "prixVenteExport"],
  ["hs_code", "hsCode"],
];

const HEADER_LOOKUP = new Map<string, string>();

for (const col of BATCH_COLUMNS) {
  registerHeaderAlias(col.key, col.key);
  registerHeaderAlias(col.label, col.key);
}

for (const [alias, key] of LEGACY_HEADER_ALIASES) {
  registerHeaderAlias(alias, key);
}

function registerHeaderAlias(alias: string, key: string) {
  HEADER_LOOKUP.set(alias.toLowerCase(), key);
  HEADER_LOOKUP.set(normalizeHeaderText(alias), key);
}

function normalizeHeaderText(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/** Résout un libellé de colonne (FR ou clé technique) vers la clé API. */
export function resolveBatchHeader(header: string): string | null {
  const raw = String(header ?? "").trim();
  if (!raw) return null;
  return (
    HEADER_LOOKUP.get(raw.toLowerCase()) ??
    HEADER_LOOKUP.get(normalizeHeaderText(raw)) ??
    null
  );
}

/** Repère la ligne d'en-tête dans une grille Excel/CSV (clés ou libellés FR). */
export function findBatchHeaderRowIndex(rows: (string | number)[][]): number {
  let bestIndex = 0;
  let bestMatches = 0;

  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i];
    if (!row?.length) continue;
    const matches = row.filter((cell) => resolveBatchHeader(String(cell ?? "")) !== null).length;
    if (matches > bestMatches) {
      bestMatches = matches;
      bestIndex = i;
    }
  }

  return bestMatches >= 5 ? bestIndex : 0;
}

/** Convertit une grille brute en lignes CSV normalisées (clés techniques). */
export function gridToNormalizedCsv(rows: (string | number)[][]): string {
  if (rows.length === 0) {
    throw new Error("The sheet is empty.");
  }

  const headerRowIndex = findBatchHeaderRowIndex(rows);
  const headerRow = rows[headerRowIndex] ?? [];
  const keyIndexes: (string | null)[] = headerRow.map((cell) =>
    resolveBatchHeader(String(cell ?? "")),
  );

  const resolvedCount = keyIndexes.filter(Boolean).length;
  if (resolvedCount < 5) {
    const firstCell = String(headerRow[0] ?? "").toLowerCase();
    if (firstCell.includes("user guide") || firstCell.includes("regtech — user guide")) {
      throw new Error(
        `This is the user guide file. Download and import "RegTech_Simulations_Template.xlsx" instead.`,
      );
    }
    throw new Error(
      "Unrecognized headers. Download the Excel template or use technical columns (origin, destination, hsCode…).",
    );
  }

  const lines = [BATCH_HEADER_KEYS.join(",")];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row?.length) continue;

    const values = BATCH_HEADER_KEYS.map((key) => {
      const idx = keyIndexes.indexOf(key);
      const cell = idx >= 0 ? row[idx] : "";
      return normalizeGridCell(key, cell);
    });

    if (values.every((v) => !v)) continue;
    if (isNonDataRow(values)) continue;
    if (isHeaderLikeRow(values)) continue;

    lines.push(
      values
        .map((v) => {
          if (v.includes(",") || v.includes('"') || v.includes("\n")) {
            return `"${v.replace(/"/g, '""')}"`;
          }
          return v;
        })
        .join(","),
    );
  }

  if (lines.length < 2) {
    throw new Error("No data rows found under the headers.");
  }

  return lines.join("\n");
}

function normalizeGridCell(key: string, cell: unknown): string {
  const raw = String(cell ?? "").trim();
  if (!raw) return "";
  if (NUMERIC_KEYS.has(key)) {
    const n = parseBatchNumber(cell as string | number);
    return n > 0 ? String(n) : raw;
  }
  return raw;
}

function isNonDataRow(values: string[]): boolean {
  const first = values[0]?.toLowerCase().trim() ?? "";
  if (
    first.includes("▼") ||
    first.includes("your simulations") ||
    first.includes("vos simulations") ||
    first.includes("example") ||
    first.includes("exemple")
  ) {
    return true;
  }
  if (
    values.some(
      (v) =>
        /^e\.?g\.?\s/i.test(v.trim()) ||
        /^ex\.\s/i.test(v.trim()) ||
        /^ex\s/i.test(v.trim()) ||
        /^ex\s*:/i.test(v.trim()),
    )
  ) {
    return true;
  }
  return false;
}

function isHeaderLikeRow(values: string[]): boolean {
  const resolved = values.filter((v) => resolveBatchHeader(v) !== null).length;
  return resolved >= 5;
}

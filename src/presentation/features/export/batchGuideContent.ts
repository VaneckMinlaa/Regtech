import { BATCH_COLUMNS } from "@/presentation/features/export/batchColumnDefs";

export const BATCH_GUIDE_BLOCKS: [string, string][] = [
  [
    "Step 1 — Open the template",
    [
      "1. Unzip the downloaded ZIP file.",
      "2. Open \"01_Modele_Simulations_RegTech.xlsx\" (not the PDF guide).",
      "3. You’ll see the table to fill in, with examples already included.",
    ].join("\n"),
  ],
  [
    "Step 2 — Fill your simulations",
    [
      "• One row = one customs simulation.",
      "• Row 4: expected formats (e.g. CMR, e.g. 851712…) — do not import as-is.",
      "• Blue rows: concrete examples you can keep, edit, or delete.",
      "• Yellow rows: your rows to complete.",
      "• Amounts in the local currency of the origin country.",
    ].join("\n"),
  ],
  [
    "Step 3 — Import into RegTech",
    [
      "1. Save the filled template.",
      "2. RegTech → Batch processing → Import CSV or Excel.",
      "3. Select \"01_Modele_Simulations_RegTech.xlsx\".",
      "4. Tax calculation and AfCFTA eligibility start automatically.",
    ].join("\n"),
  ],
  [
    "Template columns",
    BATCH_COLUMNS.map((c) => `• ${c.label} — ${c.hint}`).join("\n"),
  ],
  [
    "Country codes (3-letter ISO)",
    "CMR Cameroon · NGA Nigeria · GHA Ghana · CIV Côte d'Ivoire · KEN Kenya · SEN Senegal · ZAF South Africa",
  ],
  [
    "AfCFTA simulation years",
    "2025: full tariff · 2026: −75% · 2027: −80% · 2028: −85% · 2029: −90% · 2030: total exemption",
  ],
];

export const BATCH_GUIDE_SUBTITLE =
  "This guide accompanies the \"01_Modele_Simulations_RegTech.xlsx\" Excel template. Import only the Excel model in RegTech.";

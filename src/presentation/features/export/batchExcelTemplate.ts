/**
 * Génère et télécharge le modèle Excel + guide (archive ZIP).
 */

import { BATCH_COLUMNS, BATCH_SAMPLE_ROWS } from "@/presentation/features/export/batchColumnDefs";

const BRAND_PRIMARY = "FF7A5AF8";
const BRAND_PRIMARY_DARK = "FF5925DC";
const BRAND_DARK = "FF101828";
const BRAND_SURFACE = "FFF4F3FF";
const BORDER = "FFE5E7EB";
const TEXT_MUTED = "FF6B7280";
const TEXT_DARK = "FF111827";
const ROW_EXAMPLE = "FFDBEAFE";
const ROW_FILL = "FFFFFBEB";
const SECTION_BG = "FFE0E7FF";

const NUMERIC_KEYS = new Set([
  "declaredValueLocal",
  "costMatiereLocale",
  "mainOeuvreLocale",
  "fraisLocaux",
  "prixVenteExport",
  "year",
]);

const FORMAT_HINTS = [
  "ex. CMR",
  "ex. NGA",
  "ex. 851712",
  "ex. 1 000 000",
  "ex. 400 000",
  "ex. 150 000",
  "ex. 100 000",
  "ex. 1 000 000",
  "ex. 2026",
];

function colLetter(count: number): string {
  return String.fromCharCode(64 + count);
}

export async function downloadBatchExcelTemplate(): Promise<void> {
  const [ExcelJS, JSZip] = await Promise.all([import("exceljs"), import("jszip")]);

  const templateWorkbook = new ExcelJS.Workbook();
  templateWorkbook.creator = "RegTech";
  buildTemplateSheet(templateWorkbook.addWorksheet("Simulations"));
  const templateBuffer = await templateWorkbook.xlsx.writeBuffer();

  const guideWorkbook = new ExcelJS.Workbook();
  guideWorkbook.creator = "RegTech";
  buildGuideSheet(guideWorkbook.addWorksheet("Guide", { views: [{ showGridLines: false }] }));
  const guideBuffer = await guideWorkbook.xlsx.writeBuffer();

  const zip = new JSZip.default();
  zip.file("01_Modele_Simulations_RegTech.xlsx", templateBuffer);
  zip.file("02_Guide_Utilisation_RegTech.xlsx", guideBuffer);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "RegTech_Simulation_ZLECAf.zip";
  link.click();
  URL.revokeObjectURL(url);
}

function buildGuideSheet(sheet: import("exceljs").Worksheet) {
  sheet.columns = [{ width: 78 }];

  const title = sheet.getCell("A1");
  title.value = "RegTech — Guide d'utilisation (simulation par lot)";
  title.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 36;

  const subtitle = sheet.getCell("A2");
  subtitle.value =
    "Ce fichier est fourni avec le modèle « 01_Modele_Simulations_RegTech.xlsx ». Importez uniquement le modèle dans RegTech.";
  subtitle.font = { name: "Calibri", size: 11, color: { argb: TEXT_MUTED } };
  subtitle.alignment = { wrapText: true, vertical: "top" };
  sheet.getRow(2).height = 28;

  const blocks: [string, string][] = [
    [
      "Étape 1 — Ouvrir le modèle",
      [
        "1. Décompressez le fichier ZIP téléchargé.",
        "2. Ouvrez « 01_Modele_Simulations_RegTech.xlsx » (pas ce guide).",
        "3. Vous verrez directement le tableau à remplir avec des exemples.",
      ].join("\n"),
    ],
    [
      "Étape 2 — Remplir vos simulations",
      [
        "• Une ligne = une simulation douanière.",
        "• Ligne 4 : formats attendus (ex. CMR, ex. 851712…) — ne pas importer telle quelle.",
        "• Lignes bleues : exemples concrets que vous pouvez garder, modifier ou supprimer.",
        "• Lignes jaunes : vos lignes à compléter.",
        "• Montants en devise locale du pays d'origine.",
      ].join("\n"),
    ],
    [
      "Étape 3 — Importer dans RegTech",
      [
        "1. Enregistrez le modèle rempli.",
        "2. RegTech → Traitement par lot → Importer CSV ou Excel.",
        "3. Sélectionnez « 01_Modele_Simulations_RegTech.xlsx ».",
        "4. Le calcul des taxes et l'éligibilité AfCFTA démarrent automatiquement.",
      ].join("\n"),
    ],
    [
      "Colonnes du modèle",
      BATCH_COLUMNS.map((c) => `• ${c.label} — ${c.hint}`).join("\n"),
    ],
    [
      "Codes pays (ISO 3 lettres)",
      "CMR Cameroun · NGA Nigeria · GHA Ghana · CIV Côte d'Ivoire · KEN Kenya · SEN Sénégal · ZAF Afrique du Sud",
    ],
    [
      "Années de simulation AfCFTA",
      "2025 : tarif plein · 2026 : −75 % · 2027 : −80 % · 2028 : −85 % · 2029 : −90 % · 2030 : exemption totale",
    ],
  ];

  let row = 4;
  for (const [heading, body] of blocks) {
    const headCell = sheet.getCell(`A${row}`);
    headCell.value = heading;
    headCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: BRAND_PRIMARY_DARK } };
    headCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_SURFACE } };
    headCell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
    sheet.getRow(row).height = 22;
    row++;

    const bodyCell = sheet.getCell(`A${row}`);
    bodyCell.value = body;
    bodyCell.font = { name: "Calibri", size: 10, color: { argb: TEXT_DARK } };
    bodyCell.alignment = { wrapText: true, vertical: "top" };
    bodyCell.border = {
      bottom: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
    sheet.getRow(row).height = Math.max(44, body.split("\n").length * 15);
    row += 2;
  }
}

function buildTemplateSheet(sheet: import("exceljs").Worksheet) {
  const colCount = BATCH_COLUMNS.length;
  const lastCol = colLetter(colCount);

  sheet.mergeCells(`A1:${lastCol}1`);
  const banner = sheet.getCell("A1");
  banner.value = "RegTech — Modèle à remplir (importez CE fichier dans l'application)";
  banner.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_DARK } };
  banner.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 32;

  sheet.mergeCells(`A2:${lastCol}2`);
  const hint = sheet.getCell("A2");
  hint.value =
    "Complétez les lignes jaunes. Les lignes bleues sont des exemples. Le guide détaillé est dans le fichier « 02_Guide_Utilisation_RegTech.xlsx ».";
  hint.font = { name: "Calibri", size: 10, italic: true, color: { argb: TEXT_MUTED } };
  hint.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_SURFACE } };
  hint.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  sheet.getRow(2).height = 28;

  const headerRow = sheet.getRow(3);
  headerRow.height = 36;
  BATCH_COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.label;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
    cell.note = col.hint;
    sheet.getColumn(i + 1).width = col.width;
  });

  const formatRow = sheet.getRow(4);
  formatRow.height = 20;
  FORMAT_HINTS.forEach((hintText, i) => {
    const cell = formatRow.getCell(i + 1);
    cell.value = hintText;
    cell.font = { name: "Calibri", size: 9, italic: true, color: { argb: TEXT_MUTED } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder();
  });

  addSectionRow(sheet, 5, lastCol, "▼ EXEMPLES — vous pouvez modifier ou supprimer ces lignes");

  BATCH_SAMPLE_ROWS.forEach((sample, rowIdx) => {
    const row = sheet.getRow(6 + rowIdx);
    row.height = 24;
    sample.forEach((value, colIdx) => {
      const key = BATCH_COLUMNS[colIdx]?.key ?? "";
      styleDataCell(row.getCell(colIdx + 1), value, key, ROW_EXAMPLE);
    });
  });

  const fillStart = 6 + BATCH_SAMPLE_ROWS.length;
  addSectionRow(sheet, fillStart, lastCol, "▼ VOS SIMULATIONS — à remplir ci-dessous");

  for (let r = 0; r < 12; r++) {
    const row = sheet.getRow(fillStart + 1 + r);
    row.height = 24;
    BATCH_COLUMNS.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = null;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ROW_FILL } };
      cell.border = thinBorder();
      if (NUMERIC_KEYS.has(col.key)) {
        cell.numFmt = col.key === "year" ? "0" : "#,##0";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  }

  sheet.views = [{ state: "frozen", ySplit: 3, activeCell: "A6" }];
  sheet.autoFilter = { from: "A3", to: `${lastCol}3` };
}

function addSectionRow(sheet: import("exceljs").Worksheet, rowNum: number, lastCol: string, label: string) {
  sheet.mergeCells(`A${rowNum}:${lastCol}${rowNum}`);
  const cell = sheet.getCell(`A${rowNum}`);
  cell.value = label;
  cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BRAND_PRIMARY_DARK } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SECTION_BG } };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(rowNum).height = 22;
}

function styleDataCell(
  cell: import("exceljs").Cell,
  value: string | number,
  key: string,
  bg: string,
) {
  cell.value = value;
  cell.font = { name: "Calibri", size: 10, color: { argb: TEXT_DARK } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  cell.border = thinBorder();
  cell.alignment = {
    vertical: "middle",
    horizontal: NUMERIC_KEYS.has(key) ? "right" : "center",
  };
  if (NUMERIC_KEYS.has(key) && typeof value === "number") {
    cell.numFmt = key === "year" ? "0" : "#,##0";
  }
}

function thinBorder(): Partial<import("exceljs").Borders> {
  return {
    top: { style: "thin", color: { argb: BORDER } },
    bottom: { style: "thin", color: { argb: BORDER } },
    left: { style: "thin", color: { argb: BORDER } },
    right: { style: "thin", color: { argb: BORDER } },
  };
}

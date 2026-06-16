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

const TEMPLATE_FILENAME = "01_RegTech_Simulations_Template.xlsx";
const GUIDE_FILENAME = "02_RegTech_User_Guide.xlsx";

const FORMAT_HINTS = [
  "e.g. CMR",
  "e.g. NGA",
  "e.g. 851712",
  "e.g. 1,000,000",
  "e.g. 400,000",
  "e.g. 150,000",
  "e.g. 100,000",
  "e.g. 1,000,000",
  "e.g. 2026",
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
  zip.file(TEMPLATE_FILENAME, templateBuffer);
  zip.file(GUIDE_FILENAME, guideBuffer);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "RegTech_Simulation_AfCFTA.zip";
  link.click();
  URL.revokeObjectURL(url);
}

function buildGuideSheet(sheet: import("exceljs").Worksheet) {
  sheet.columns = [{ width: 78 }];

  const title = sheet.getCell("A1");
  title.value = "RegTech — User guide (batch simulation)";
  title.font = { name: "Calibri", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_PRIMARY } };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 36;

  const subtitle = sheet.getCell("A2");
  subtitle.value =
    `This file comes with the "${TEMPLATE_FILENAME}" Excel template. Import only the Excel template in RegTech.`;
  subtitle.font = { name: "Calibri", size: 11, color: { argb: TEXT_MUTED } };
  subtitle.alignment = { wrapText: true, vertical: "top" };
  sheet.getRow(2).height = 28;

  const blocks: [string, string][] = [
    [
      "Step 1 — Open the template",
      [
        "1. Unzip the downloaded ZIP file.",
        `2. Open "${TEMPLATE_FILENAME}" (not this guide).`,
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
        `3. Select "${TEMPLATE_FILENAME}".`,
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
  banner.value = "RegTech — Template to fill (import this file in the app)";
  banner.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_DARK } };
  banner.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 32;

  sheet.mergeCells(`A2:${lastCol}2`);
  const hint = sheet.getCell("A2");
  hint.value =
    `Fill the yellow rows. Blue rows are examples. The detailed guide is in the "${GUIDE_FILENAME}" file.`;
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

  addSectionRow(sheet, 5, lastCol, "▼ EXAMPLES — you can edit or delete these rows");

  BATCH_SAMPLE_ROWS.forEach((sample, rowIdx) => {
    const row = sheet.getRow(6 + rowIdx);
    row.height = 24;
    sample.forEach((value, colIdx) => {
      const key = BATCH_COLUMNS[colIdx]?.key ?? "";
      styleDataCell(row.getCell(colIdx + 1), value, key, ROW_EXAMPLE);
    });
  });

  const fillStart = 6 + BATCH_SAMPLE_ROWS.length;
  addSectionRow(sheet, fillStart, lastCol, "▼ YOUR SIMULATIONS — fill in below");

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

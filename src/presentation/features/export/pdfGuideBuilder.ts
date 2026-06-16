import type { jsPDF } from "jspdf";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 5.5;

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function writeParagraph(doc: jsPDF, text: string, y: number, fontSize = 10): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return y;
}

export async function buildRegTechGuidePdf(options: {
  title: string;
  subtitle: string;
  blocks: [string, string][];
}): Promise<ArrayBuffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFillColor(122, 90, 248);
  doc.rect(0, 0, PAGE_WIDTH, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(options.title, MARGIN, 18);

  let y = 36;
  doc.setTextColor(107, 114, 128);
  y = writeParagraph(doc, options.subtitle, y, 10);
  y += 4;

  for (const [heading, body] of options.blocks) {
    y = ensureSpace(doc, y, LINE_HEIGHT * 3);
    doc.setTextColor(89, 37, 220);
    doc.setFontSize(12);
    doc.text(heading, MARGIN, y);
    y += LINE_HEIGHT + 1;
    doc.setTextColor(17, 24, 39);
    y = writeParagraph(doc, body, y, 10);
    y += 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  y = ensureSpace(doc, y, LINE_HEIGHT * 2);
  doc.text("RegTech — Assistant douanier AfCFTA · regtech", MARGIN, y);

  return doc.output("arraybuffer");
}

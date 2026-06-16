import { CAMEROON_IMPORT_STEPS } from "@/presentation/features/procedures/checklistData";
import { buildRegTechGuidePdf } from "@/presentation/features/export/pdfGuideBuilder";

function checklistGuideBlocks(): [string, string][] {
  return CAMEROON_IMPORT_STEPS.map((step, index) => [
    `${String(index + 1).padStart(2, "0")} — ${step.title}`,
    [
      step.detail,
      `Documents: ${step.docs.join(", ")}`,
      `Typical duration: ${step.duration}`,
      "link" in step && step.link ? `Portal: ${step.link}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  ]);
}

export async function downloadChecklistGuidePdf(): Promise<void> {
  const buffer = await buildRegTechGuidePdf({
    title: "RegTech — Cameroon import checklist",
    subtitle:
      "e-GUCE / CAMCIS journey in 12 steps. Check off each step in the app to track your progress.",
    blocks: checklistGuideBlocks(),
  });

  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "RegTech_Cameroon_Import_Checklist.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

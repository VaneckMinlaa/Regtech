import { CAMEROON_IMPORT_STEPS } from "@/presentation/features/procedures/checklistData";
import { buildRegTechGuidePdf } from "@/presentation/features/export/pdfGuideBuilder";

function checklistGuideBlocks(): [string, string][] {
  return CAMEROON_IMPORT_STEPS.map((step, index) => [
    `${String(index + 1).padStart(2, "0")} — ${step.title}`,
    [
      step.detail,
      `Documents : ${step.docs.join(", ")}`,
      `Durée indicative : ${step.duration}`,
      "link" in step && step.link ? `Portail : ${step.link}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  ]);
}

export async function downloadChecklistGuidePdf(): Promise<void> {
  const buffer = await buildRegTechGuidePdf({
    title: "RegTech — Checklist import Cameroun",
    subtitle:
      "Parcours e-GUCE / CAMCIS en 12 étapes. Cochez chaque étape dans l'application pour suivre votre progression.",
    blocks: checklistGuideBlocks(),
  });

  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "RegTech_Checklist_Import_Cameroun.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

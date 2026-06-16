import { ArrowLeft } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";
import { platform } from "@/presentation/theme/platformStyles";

interface SimulationCertificatePageProps {
  simulation: SimulationResult;
  darkMode?: boolean;
  onBack: () => void;
}

export function SimulationCertificatePage({
  simulation,
  darkMode = true,
  onBack,
}: SimulationCertificatePageProps) {
  const dateLabel = new Date(simulation.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="simulation_certificate_page">
      <PlatformPageIntro
        title="Pro-forma eligibility certificate"
        description={`Ref. ${simulation.id} · ${dateLabel} · HS ${simulation.hsCode}`}
        darkMode={darkMode}
        trailing={
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${platform.buttonGhost(darkMode)}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to estimate
          </button>
        }
      />

      <SectionPanel darkMode={darkMode}>
        <DeclarationSummary simulation={simulation} darkMode={darkMode} />
      </SectionPanel>
    </div>
  );
}

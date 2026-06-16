import { ArrowLeft, FileText } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { SimulationTaxEstimate } from "@/presentation/features/tariff-calculator/SimulationTaxEstimate";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";
import { platform } from "@/presentation/theme/platformStyles";

interface SimulationEstimatePageProps {
  simulation: SimulationResult;
  darkMode?: boolean;
  onBack: () => void;
  onOpenCertificate: () => void;
}

export function SimulationEstimatePage({
  simulation,
  darkMode = true,
  onBack,
  onOpenCertificate,
}: SimulationEstimatePageProps) {
  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="simulation_estimate_page">
      <PlatformPageIntro
        title="Tax estimate"
        description={`${simulation.productDescription} · HS ${simulation.hsCode}`}
        darkMode={darkMode}
        trailing={
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${platform.buttonGhost(darkMode)}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to simulator
          </button>
        }
      />

      <SectionPanel darkMode={darkMode}>
        <SimulationTaxEstimate simulation={simulation} darkMode={darkMode} />
      </SectionPanel>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onOpenCertificate}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium ${platform.buttonPrimary}`}
          id="btn_open_simulation_certificate"
        >
          <FileText className="h-4 w-4" />
          View pro-forma certificate
        </button>
      </div>
    </div>
  );
}

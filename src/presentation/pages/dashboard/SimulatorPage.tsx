import React from "react";
import type { SimulationResult } from "@/domain/reference/types";
import { SimulateurTaxes } from "@/presentation/features/tariff-calculator/SimulateurTaxes";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";

interface SimulatorPageProps {
  darkMode?: boolean;
  initialHSCode?: string;
  initialProductDesc?: string;
  selectedSimulation: SimulationResult | null;
  onSimulationRun: (result: SimulationResult) => void;
  onUpgrade: () => void;
  onOpenHistory: () => void;
}

export function SimulatorPage({
  darkMode = true,
  initialHSCode = "",
  initialProductDesc = "",
  selectedSimulation,
  onSimulationRun,
  onUpgrade,
  onOpenHistory,
}: SimulatorPageProps) {
  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="simulator_page">
      <SimulateurTaxes
        onSimulationRun={onSimulationRun}
        initialHSCode={initialHSCode}
        initialProductDesc={initialProductDesc}
        darkMode={darkMode}
        onUpgrade={onUpgrade}
      />

      {selectedSimulation && (
        <SectionPanel darkMode={darkMode} id="simulation_results_panel">
          <DeclarationSummary simulation={selectedSimulation} darkMode={darkMode} />
        </SectionPanel>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={onOpenHistory}
          className="text-xs font-semibold text-primary-500 hover:underline"
        >
          View full history →
        </button>
      </div>
    </div>
  );
}

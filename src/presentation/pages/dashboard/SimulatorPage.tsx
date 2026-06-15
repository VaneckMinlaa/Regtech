import React from "react";
import type { SimulationResult } from "@/domain/reference/types";
import { SimulateurTaxes } from "@/presentation/features/tariff-calculator/SimulateurTaxes";
import { MetricsChart } from "@/presentation/features/export/MetricsChart";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";

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
    <div className="space-y-6 animate-fadeIn font-sans" id="simulator_page">
      <SimulateurTaxes
        onSimulationRun={onSimulationRun}
        initialHSCode={initialHSCode}
        initialProductDesc={initialProductDesc}
        darkMode={darkMode}
        onUpgrade={onUpgrade}
      />

      {selectedSimulation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricsChart
            baseTax={selectedSimulation.baseTariffRate}
            projection={selectedSimulation.tariffProjection ?? []}
            isEligible={selectedSimulation.isEligiblePrefAfCFTA}
            darkMode={darkMode}
          />
          <DeclarationSummary simulation={selectedSimulation} darkMode={darkMode} />
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={onOpenHistory}
          className={`text-xs font-bold text-primary-500 hover:underline`}
        >
          Voir l&apos;historique complet →
        </button>
      </div>
    </div>
  );
}

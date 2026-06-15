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
        <div
          className={`space-y-8 pt-8 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}
          id="simulation_results_panel"
        >
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

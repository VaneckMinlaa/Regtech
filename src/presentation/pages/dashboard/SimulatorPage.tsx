import React, { useCallback, useEffect, useState } from "react";
import type { SimulationResult } from "@/domain/reference/types";
import { SimulateurTaxes } from "@/presentation/features/tariff-calculator/SimulateurTaxes";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";
import { PAGE_INTROS } from "@/presentation/layout/pageIntros";
import {
  persistLastSimulation,
  readLastSimulation,
  readSimulatorViewFromUrl,
  writeSimulatorViewToUrl,
  type SimulatorView,
} from "@/presentation/layout/dashboardTabs";
import { SimulationEstimatePage } from "@/presentation/pages/dashboard/SimulationEstimatePage";
import { SimulationCertificatePage } from "@/presentation/pages/dashboard/SimulationCertificatePage";
import { platform } from "@/presentation/theme/platformStyles";

interface SimulatorPageProps {
  darkMode?: boolean;
  initialHSCode?: string;
  initialProductDesc?: string;
  simulation: SimulationResult | null;
  onSimulationRun: (result: SimulationResult) => void;
  onUpgrade: () => void;
  onOpenHistory: () => void;
}

export function SimulatorPage({
  darkMode = true,
  initialHSCode = "",
  initialProductDesc = "",
  simulation,
  onSimulationRun,
  onUpgrade,
  onOpenHistory,
}: SimulatorPageProps) {
  const [view, setView] = useState<SimulatorView>(() => readSimulatorViewFromUrl());

  const resolvedSimulation =
    simulation ?? (view !== "form" ? readLastSimulation() : null);

  useEffect(() => {
    const syncFromUrl = () => setView(readSimulatorViewFromUrl());
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const handleSimulationComplete = useCallback(
    (result: SimulationResult) => {
      persistLastSimulation(result);
      onSimulationRun(result);
      writeSimulatorViewToUrl("estimate", "push");
      setView("estimate");
    },
    [onSimulationRun],
  );

  const backToForm = useCallback(() => {
    writeSimulatorViewToUrl("form", "push");
    setView("form");
  }, []);

  const openCertificate = useCallback(() => {
    writeSimulatorViewToUrl("certificate", "push");
    setView("certificate");
  }, []);

  const backToEstimate = useCallback(() => {
    writeSimulatorViewToUrl("estimate", "push");
    setView("estimate");
  }, []);

  if (view === "certificate" && resolvedSimulation) {
    return (
      <SimulationCertificatePage
        simulation={resolvedSimulation}
        darkMode={darkMode}
        onBack={backToEstimate}
      />
    );
  }

  if (view === "estimate" && resolvedSimulation) {
    return (
      <SimulationEstimatePage
        simulation={resolvedSimulation}
        darkMode={darkMode}
        onBack={backToForm}
        onOpenCertificate={openCertificate}
      />
    );
  }

  if (view !== "form" && !resolvedSimulation) {
    return (
      <div className="animate-fadeIn space-y-4 font-sans" id="simulation_view_missing">
        <PlatformPageIntro
          title="Simulation unavailable"
          description="Run a new simulation from the form below."
          darkMode={darkMode}
        />
        <button
          type="button"
          onClick={backToForm}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
        >
          Back to simulator
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="simulator_page">
      <PlatformPageIntro
        title={PAGE_INTROS.SIM.title}
        description={PAGE_INTROS.SIM.description}
        darkMode={darkMode}
      />

      <SimulateurTaxes
        onSimulationRun={handleSimulationComplete}
        initialHSCode={initialHSCode}
        initialProductDesc={initialProductDesc}
        darkMode={darkMode}
        onUpgrade={onUpgrade}
      />

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

import React from "react";
import { Lock, ArrowRight } from "lucide-react";

interface UpgradeRequiredPanelProps {
  feature: string;
  message?: string;
  darkMode?: boolean;
  onUpgrade: () => void;
}

export function UpgradeRequiredPanel({
  feature,
  message,
  darkMode = true,
  onUpgrade,
}: UpgradeRequiredPanelProps) {
  return (
    <div
      className={`rounded-lg border p-6 text-center space-y-4 ${
        darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}
      id="upgrade_required_panel"
    >
      <div
        className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
          darkMode ? "bg-rose-950/50 text-rose-400" : "bg-rose-50 text-rose-600"
        }`}
      >
        <Lock className="w-5 h-5" />
      </div>
      <div>
        <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Quota atteint — {feature}
        </h3>
        <p className={`text-xs mt-2 max-w-sm mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {message ??
            "Passez à un plan supérieur pour continuer. Paiement Mobile Money via PawaPay dans tous les pays couverts."}
        </p>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-500 text-white text-xs font-bold"
      >
        Choisir un plan
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

import React from "react";
import { Lock, ArrowRight } from "lucide-react";
import { platform } from "@/presentation/theme/platformStyles";

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
      className={`${platform.panel(darkMode)} ${platform.panelPadding} space-y-4 text-center`}
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
          Quota reached — {feature}
        </h3>
        <p className={`text-xs mt-2 max-w-sm mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {message ??
            "Upgrade to a higher plan to continue. Mobile Money payments via PawaPay in all supported countries."}
        </p>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className={`${platform.buttonGradient} gap-2 px-5 py-2 text-sm`}
      >
      Choose a plan
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

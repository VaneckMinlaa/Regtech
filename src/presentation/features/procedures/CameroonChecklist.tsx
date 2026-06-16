import React, { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  CAMEROON_IMPORT_STEPS,
  type ChecklistStepId,
} from "./checklistData";
import { ChecklistProgressStepper } from "@/presentation/features/procedures/ChecklistProgressStepper";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { getPlanById } from "@/domain/billing/plans";
import { UpgradeRequiredPanel } from "@/presentation/features/billing/UpgradeRequiredPanel";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
import { platform } from "@/presentation/theme/platformStyles";

const STORAGE_KEY = "regtech_checklist_cm_v1";

interface CameroonChecklistProps {
  darkMode?: boolean;
  onUpgrade: () => void;
}

export function CameroonChecklist({ darkMode = true, onUpgrade }: CameroonChecklistProps) {
  const { subscription } = useSubscription();
  const plan = getPlanById(subscription.plan);

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  if (!plan.quotas.checklist) {
    return (
      <UpgradeRequiredPanel
        feature="Cameroon import checklist"
        message="Available starting from the Starter plan. Pay using PawaPay in all supported countries."
        darkMode={darkMode}
        onUpgrade={onUpgrade}
      />
    );
  }

  const toggle = (id: ChecklistStepId) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-fadeIn" id="checklist_cameroon_page">
      <SectionPanel darkMode={darkMode} id="checklist_steps_panel">
        <ChecklistProgressStepper checked={checked} darkMode={darkMode} />
        <h2 className={`mb-4 mt-6 text-sm font-semibold ${platform.textPrimary(darkMode)}`}>e-GUCE / CAMCIS steps</h2>
        <ol className="space-y-3">
        {CAMEROON_IMPORT_STEPS.map((step, index) => {
          const isDone = !!checked[step.id];
          return (
            <li
              key={step.id}
              className={`rounded-2xl border p-4 transition-colors ${
                isDone
                  ? darkMode
                    ? "border-primary-500/30 bg-primary-950/20"
                    : "border-primary-200 bg-primary-50/50"
                  : darkMode
                    ? "border-gray-800 bg-dark-primary/50"
                    : "border-gray-200 bg-white"
              }`}
            >
              <label className="flex gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(step.id)}
                  className="mt-1 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {step.title}
                    </span>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
                    {"alert" in step && step.alert && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {step.alert}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {step.detail}
                  </p>
                  <p className={`text-[10px] mt-2 font-mono ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Docs: {step.docs.join(" · ")} · ~{step.duration}
                  </p>
                  {"link" in step && step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary-500 hover:underline mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open portal <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </label>
            </li>
          );
        })}
        </ol>
      </SectionPanel>
    </div>
  );
}
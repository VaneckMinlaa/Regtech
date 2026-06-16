import { Check } from "lucide-react";
import {
  CAMEROON_IMPORT_STEPS,
  type ChecklistStepId,
} from "@/presentation/features/procedures/checklistData";
import { platform } from "@/presentation/theme/platformStyles";

interface ChecklistProgressStepperProps {
  checked: Record<string, boolean>;
  darkMode?: boolean;
}

export function ChecklistProgressStepper({ checked, darkMode = true }: ChecklistProgressStepperProps) {
  const steps = CAMEROON_IMPORT_STEPS;
  const doneCount = steps.filter((s) => checked[s.id]).length;
  const currentIndex = steps.findIndex((s) => !checked[s.id]);
  const allDone = currentIndex === -1;
  const activeIndex = allDone ? -1 : currentIndex;
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : null;

  return (
    <div className="space-y-4" id="checklist_progress_stepper">
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="relative min-w-[640px] pt-8">
          <div
            className={`absolute top-[2.125rem] left-4 right-4 h-0.5 ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
            aria-hidden
          />
          <ol className="relative flex justify-between">
            {steps.map((step, index) => {
              const isDone = !!checked[step.id];
              const isActive = !allDone && index === activeIndex;
              const isComplete = isDone;

              return (
                <li key={step.id} className="flex flex-1 flex-col items-center">
                  <span
                    className={`mb-3 max-w-[4.5rem] text-center text-[10px] font-medium leading-tight ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : isComplete
                          ? platform.textSecondary(darkMode)
                          : platform.textMuted(darkMode)
                    }`}
                  >
                    {step.title}
                  </span>
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <span
                        className="absolute -left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-400"
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                        isComplete
                          ? "border-teal-500 bg-teal-500 text-white"
                          : isActive
                            ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500"
                            : darkMode
                              ? "border-gray-600 bg-dark-primary text-gray-500"
                              : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isComplete || isActive ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-transparent" />
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className={`flex items-center justify-between text-xs ${platform.textMuted(darkMode)}`}>
        <span>
          {allDone
            ? "All steps complete"
            : `Step ${activeIndex + 1} of ${steps.length}${activeStep ? ` — ${activeStep.title}` : ""}`}
        </span>
        <span className="font-semibold text-primary-500">
          {doneCount}/{steps.length} complete
        </span>
      </div>
    </div>
  );
}

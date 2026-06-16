import { Check } from "lucide-react";
import {
  CAMEROON_IMPORT_STEPS,
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

  const lineClass = darkMode ? "bg-gray-700" : "bg-gray-200";
  const lineDoneClass = "bg-teal-500";

  return (
    <div className="space-y-4" id="checklist_progress_stepper">
      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[720px] px-2">
          <ol className="relative flex justify-between">
            {steps.map((step, index) => {
              const isDone = !!checked[step.id];
              const isActive = !allDone && index === activeIndex;
              const segmentDone = isDone;

              return (
                <li
                  key={step.id}
                  className="relative flex flex-1 flex-col items-center"
                  style={{ minWidth: "3.5rem" }}
                >
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-[1.125rem] left-[calc(50%+0.875rem)] right-[calc(-50%+0.875rem)] h-0.5 ${
                        segmentDone ? lineDoneClass : lineClass
                      }`}
                      aria-hidden
                    />
                  )}

                  <span
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                      isDone
                        ? "border-teal-500 bg-teal-500 text-white"
                        : isActive
                          ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500"
                          : darkMode
                            ? "border-gray-600 bg-dark-primary text-gray-500"
                            : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    className={`mt-2 max-w-[4.75rem] text-center text-[9px] font-medium leading-tight line-clamp-2 ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : isDone
                          ? platform.textSecondary(darkMode)
                          : platform.textMuted(darkMode)
                    }`}
                    title={step.title}
                  >
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-2 text-xs ${platform.textMuted(darkMode)}`}>
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

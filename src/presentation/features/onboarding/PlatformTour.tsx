import React, { useEffect, useLayoutEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DashboardTab } from "@/presentation/layout/dashboardTabs";
import {
  PLATFORM_TOUR_STEPS,
  type PlatformTourStep,
} from "@/presentation/features/onboarding/platformTourSteps";
import { platform } from "@/presentation/theme/platformStyles";

interface PlatformTourProps {
  stepIndex: number;
  darkMode?: boolean;
  onStepChange: (index: number) => void;
  onNavigate?: (tab: DashboardTab) => void;
  onClose: () => void;
  onOpenSidebar?: () => void;
}

function useTargetRect(targetId: string | undefined, stepIndex: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.getElementById(targetId);
      if (!el) {
        setRect(null);
        return;
      }
      setRect(el.getBoundingClientRect());
      el.classList.add("platform-tour-spotlight");
    };

    update();
    const timer = window.setTimeout(update, 120);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      const el = document.getElementById(targetId);
      el?.classList.remove("platform-tour-spotlight");
    };
  }, [targetId, stepIndex]);

  return rect;
}

function TourCard({
  step,
  stepIndex,
  total,
  darkMode,
  onPrev,
  onNext,
  onSkip,
  style,
}: {
  step: PlatformTourStep;
  stepIndex: number;
  total: number;
  darkMode: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  style?: React.CSSProperties;
}) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const stepLabel = String(stepIndex + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform_tour_title"
      className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-xl border shadow-2xl ${
        darkMode ? "border-gray-700 bg-dark-primary text-gray-100" : "border-gray-200 bg-white text-gray-900 shadow-theme-sm"
      }`}
      style={style}
      id="platform_tour_card"
    >
      <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" aria-hidden />

      <div className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${platform.textMuted(darkMode)}`}>
            Step {stepLabel} / {totalLabel}
          </p>
          <h2 id="platform_tour_title" className={`mt-1 text-lg font-bold font-display ${platform.textPrimary(darkMode)}`}>
            {step.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className={`shrink-0 rounded-full p-1.5 ${platform.textMuted(darkMode)} hover:bg-black/5 dark:hover:bg-white/10`}
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className={`text-sm leading-relaxed ${platform.textSecondary(darkMode)}`}>{step.body}</p>

      {step.tips && step.tips.length > 0 && (
        <ul className={`mt-4 space-y-2 text-sm ${platform.textMuted(darkMode)}`}>
          {step.tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-primary-500" aria-hidden>
                •
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className={`text-sm font-medium ${platform.textMuted(darkMode)} hover:text-primary-500`}
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${platform.buttonPrimary}`}
          >
            {isLast ? "Get started" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex
                ? "w-6 bg-primary-500"
                : `w-1.5 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`
            }`}
            aria-hidden
          />
        ))}
      </div>
      </div>
    </div>
  );
}

export function PlatformTour({
  stepIndex,
  darkMode = true,
  onStepChange,
  onNavigate,
  onClose,
  onOpenSidebar,
}: PlatformTourProps) {
  const step = PLATFORM_TOUR_STEPS[stepIndex];
  const rect = useTargetRect(step?.targetId, stepIndex);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!step?.tab) return;
    onNavigate?.(step.tab);
    if (step.targetId && window.innerWidth < 768) {
      onOpenSidebar?.();
    }
  }, [step?.tab, step?.targetId, stepIndex, onNavigate, onOpenSidebar]);

  useLayoutEffect(() => {
    if (!rect) {
      setCardStyle({
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 120,
        padding: "0 1rem",
        maxWidth: "28rem",
        width: "100%",
      });
      return;
    }

    const gap = 16;
    const cardWidth = Math.min(400, window.innerWidth - 32);
    const cardHeight = 320;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.right + gap;
    let top = rect.top;

    if (left + cardWidth > viewportW - 16) {
      left = Math.max(16, rect.left);
      top = rect.bottom + gap;
    }

    if (top + cardHeight > viewportH - 16) {
      top = Math.max(16, rect.top - cardHeight - gap);
    }

    if (viewportW < 768) {
      left = (viewportW - cardWidth) / 2;
      top = Math.min(viewportH - cardHeight - 16, rect.bottom + gap);
    }

    setCardStyle({
      position: "fixed",
      left,
      top,
      zIndex: 120,
      width: cardWidth,
      maxWidth: "28rem",
    });
  }, [rect, stepIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!step) return null;

  const goNext = () => {
    if (stepIndex >= PLATFORM_TOUR_STEPS.length - 1) onClose();
    else onStepChange(stepIndex + 1);
  };

  const goPrev = () => {
    if (stepIndex > 0) onStepChange(stepIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-[110]" id="platform_tour" aria-live="polite">
      <div
        className="absolute inset-0 bg-[#101828]/60 backdrop-blur-[1px]"
        onClick={() => onClose()}
        aria-hidden
      />

      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-primary-500 transition-all duration-300"
          style={{
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            zIndex: 115,
          }}
          aria-hidden
        />
      )}

      <TourCard
        step={step}
        stepIndex={stepIndex}
        total={PLATFORM_TOUR_STEPS.length}
        darkMode={darkMode}
        onPrev={goPrev}
        onNext={goNext}
        onSkip={onClose}
        style={cardStyle}
      />
    </div>
  );
}

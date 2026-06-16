import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

const SPOTLIGHT_PAD = 10;
const SPOTLIGHT_RADIUS = 14;

function paddedRect(rect: DOMRect) {
  return {
    x: rect.left - SPOTLIGHT_PAD,
    y: rect.top - SPOTLIGHT_PAD,
    w: rect.width + SPOTLIGHT_PAD * 2,
    h: rect.height + SPOTLIGHT_PAD * 2,
  };
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
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      setRect(el.getBoundingClientRect());
      el.classList.add("platform-tour-spotlight");
    };

    update();
    const timer = window.setTimeout(update, 180);
    const timer2 = window.setTimeout(update, 400);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      const el = document.getElementById(targetId);
      el?.classList.remove("platform-tour-spotlight");
    };
  }, [targetId, stepIndex]);

  return rect;
}

function SpotlightOverlay({
  rect,
  stepIndex,
  onClose,
}: {
  rect: DOMRect | null;
  stepIndex: number;
  onClose: () => void;
}) {
  const maskId = `platform-tour-mask-${stepIndex}`;

  if (!rect) {
    return (
      <div
        className="absolute inset-0 bg-[#101828]/70"
        onClick={onClose}
        aria-hidden
      />
    );
  }

  const { x, y, w, h } = paddedRect(rect);

  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full cursor-pointer"
        aria-hidden
        onClick={onClose}
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={w} height={h} rx={SPOTLIGHT_RADIUS} ry={SPOTLIGHT_RADIUS} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(16, 24, 40, 0.78)"
          mask={`url(#${maskId})`}
        />
      </svg>

      <div
        className="platform-tour-ring pointer-events-none fixed rounded-[14px] border-2 border-primary-500"
        style={{ left: x, top: y, width: w, height: h, zIndex: 115 }}
        aria-hidden
      />

      <div
        className="pointer-events-none fixed flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white shadow-lg"
        style={{
          left: x,
          top: y < 40 ? y + h + 8 : y - 36,
          zIndex: 116,
          maxWidth: Math.max(w, 120),
        }}
        aria-hidden
      >
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
        Focus here
      </div>
    </>
  );
}

function TourPointer({
  cardRect,
  targetRect,
  stepIndex,
}: {
  cardRect: DOMRect;
  targetRect: DOMRect;
  stepIndex: number;
}) {
  const targetCx = targetRect.left + targetRect.width / 2;
  const targetCy = targetRect.top + targetRect.height / 2;
  const cardCx = cardRect.left + cardRect.width / 2;
  const cardCy = cardRect.top + cardRect.height / 2;

  const dx = targetCx - cardCx;
  const dy = targetCy - cardCy;

  let fromX: number;
  let fromY: number;

  if (Math.abs(dx) >= Math.abs(dy)) {
    fromX = dx < 0 ? cardRect.left : cardRect.right;
    fromY = Math.min(Math.max(targetCy, cardRect.top + 16), cardRect.bottom - 16);
  } else {
    fromX = Math.min(Math.max(targetCx, cardRect.left + 16), cardRect.right - 16);
    fromY = dy < 0 ? cardRect.top : cardRect.bottom;
  }

  const toX = dx < 0 ? targetRect.right : targetRect.left;
  const toY = targetCy;

  const markerId = `platform-tour-arrow-${stepIndex}`;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[118] h-full w-full"
      aria-hidden
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
        </marker>
      </defs>
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeDasharray="7 5"
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
}

const TourCard = React.forwardRef<
  HTMLDivElement,
  {
    step: PlatformTourStep;
    stepIndex: number;
    total: number;
    darkMode: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSkip: () => void;
    style?: React.CSSProperties;
    pointerSide?: "left" | "top" | "right" | "bottom" | null;
  }
>(function TourCard(
  { step, stepIndex, total, darkMode, onPrev, onNext, onSkip, style, pointerSide },
  ref,
) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const stepLabel = String(stepIndex + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  const pointerClass =
    pointerSide === "left"
      ? "platform-tour-card-pointer-left"
      : pointerSide === "top"
        ? "platform-tour-card-pointer-top"
        : pointerSide === "right"
          ? "platform-tour-card-pointer-right"
          : pointerSide === "bottom"
            ? "platform-tour-card-pointer-bottom"
            : "";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform_tour_title"
      className={`pointer-events-auto w-full max-w-md overflow-visible rounded-xl border shadow-2xl ${pointerClass} ${
        darkMode
          ? "border-gray-700 bg-dark-primary text-gray-100"
          : "border-gray-200 bg-white text-gray-900 shadow-theme-sm"
      }`}
      style={style}
      id="platform_tour_card"
    >
      <div className="overflow-hidden rounded-xl">
        <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" aria-hidden />
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest ${platform.textMuted(darkMode)}`}>
                Step {stepLabel} / {totalLabel}
              </p>
              <h2
                id="platform_tour_title"
                className={`mt-1 text-lg font-bold font-display ${platform.textPrimary(darkMode)}`}
              >
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
                  <span className={platform.textMuted(darkMode)} aria-hidden>
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
                    ? `w-6 ${darkMode ? "bg-gray-300" : "bg-gray-700"}`
                    : `w-1.5 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [pointerSide, setPointerSide] = useState<"left" | "top" | "right" | "bottom" | null>(null);

  useEffect(() => {
    if (!step?.tab) return;
    onNavigate?.(step.tab);
    if (step.targetId && window.innerWidth < 768) {
      onOpenSidebar?.();
    }
  }, [step?.tab, step?.targetId, stepIndex, onNavigate, onOpenSidebar]);

  const measureCard = useCallback(() => {
    if (cardRef.current) {
      setCardRect(cardRef.current.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    if (!rect) {
      setPointerSide(null);
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

    const gap = 28;
    const cardWidth = Math.min(400, window.innerWidth - 32);
    const cardHeight = 340;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.right + gap;
    let top = rect.top + rect.height / 2 - cardHeight / 2;
    let side: "left" | "top" | "right" | "bottom" = "left";

    top = Math.max(16, Math.min(top, viewportH - cardHeight - 16));

    if (left + cardWidth > viewportW - 16) {
      left = Math.max(16, (viewportW - cardWidth) / 2);
      top = rect.bottom + gap;
      side = "top";
    }

    if (top + cardHeight > viewportH - 16 && rect.top - cardHeight - gap > 16) {
      top = rect.top - cardHeight - gap;
      side = "bottom";
    }

    if (viewportW < 768) {
      left = (viewportW - cardWidth) / 2;
      top = Math.min(viewportH - cardHeight - 16, rect.bottom + gap);
      side = "top";
    }

    setPointerSide(side);
    setCardStyle({
      position: "fixed",
      left,
      top,
      zIndex: 120,
      width: cardWidth,
      maxWidth: "28rem",
    });
  }, [rect, stepIndex]);

  useLayoutEffect(() => {
    measureCard();
    const timer = window.setTimeout(measureCard, 50);
    return () => window.clearTimeout(timer);
  }, [cardStyle, measureCard, stepIndex]);

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
      <SpotlightOverlay rect={rect} stepIndex={stepIndex} onClose={onClose} />

      {rect && cardRect && (
        <TourPointer cardRect={cardRect} targetRect={rect} stepIndex={stepIndex} />
      )}

      <TourCard
        ref={cardRef}
        step={step}
        stepIndex={stepIndex}
        total={PLATFORM_TOUR_STEPS.length}
        darkMode={darkMode}
        onPrev={goPrev}
        onNext={goNext}
        onSkip={onClose}
        style={cardStyle}
        pointerSide={rect ? pointerSide : null}
      />
    </div>
  );
}

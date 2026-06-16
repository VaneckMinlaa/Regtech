import { useEffect } from "react";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import type { QuotaAlert } from "@/presentation/features/billing/quotaNotifications";

interface QuotaToastProps {
  alert: QuotaAlert | null;
  darkMode?: boolean;
  onDismiss: () => void;
  onUpgrade?: () => void;
}

const AUTO_DISMISS_MS = 12_000;

export function QuotaToast({ alert, darkMode = true, onDismiss, onUpgrade }: QuotaToastProps) {
  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100%-2rem)] animate-fadeIn"
      role="alert"
      aria-live="assertive"
      id="quota_exhausted_toast"
    >
      <div
        className={`rounded-xl border shadow-theme-lg p-4 ${
          darkMode
            ? "bg-dark-primary border-rose-500/30 text-white"
            : "bg-white border-rose-200 text-gray-900"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 p-2 rounded-full ${
              darkMode ? "bg-rose-500/15 text-rose-300" : "bg-rose-50 text-rose-600"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
              {alert.title}
            </p>
            <p className={`text-xs mt-1 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {alert.message}
            </p>

            {onUpgrade ? (
              <button
                type="button"
                onClick={() => {
                  onDismiss();
                  onUpgrade();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
                id="btn_quota_toast_upgrade"
              >
                View plans
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className={`shrink-0 p-1 rounded-lg transition-colors ${
              darkMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

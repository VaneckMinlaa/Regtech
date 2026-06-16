import React from "react";
import { Zap, ArrowRight } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { getPlanById } from "@/domain/billing/plans";
import { platform } from "@/presentation/theme/platformStyles";

interface QuotaBannerProps {
  darkMode?: boolean;
  onUpgrade: () => void;
}

export function QuotaBanner({ darkMode = true, onUpgrade }: QuotaBannerProps) {
  const { subscription, remaining } = useSubscription();
  const plan = getPlanById(subscription.plan);

  const simLeft = remaining("simulations");
  const classLeft = remaining("classifications");

  if (subscription.plan !== "free" && simLeft === null) return null;

  const lowQuota =
    (simLeft !== null && simLeft <= 2) || (classLeft !== null && classLeft <= 2);

  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center ${
        lowQuota
          ? darkMode
            ? "border-rose-500/30 bg-rose-950/20"
            : "border-rose-200 bg-rose-50"
          : darkMode
            ? "border-primary-500/20 bg-primary-950/20"
            : "border-primary-200 bg-primary-50"
      }`}
      id="quota_usage_banner"
    >
      <div className="flex items-start gap-2.5">
        <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${lowQuota ? "text-rose-400" : "text-primary-400"}`} />
        <div>
          <p className={`text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Plan {plan.name}
            {subscription.provider === "pawapay" && (
              <span className="ml-2 text-[10px] font-mono text-primary-400">PawaPay</span>
            )}
          </p>
          <p className={`text-[11px] mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {simLeft !== null && (
              <span>
                {simLeft} simulation{simLeft > 1 ? "s" : ""} remaining this month
              </span>
            )}
            {simLeft !== null && classLeft !== null && " · "}
            {classLeft !== null && (
              <span>
                {classLeft} AI classification{classLeft > 1 ? "s" : ""} remaining
              </span>
            )}
            {simLeft === null && "Unlimited quotas on your current plan."}
          </p>
        </div>
      </div>
      {(subscription.plan === "free" || lowQuota) && (
        <button
          type="button"
          onClick={onUpgrade}
          className={`${platform.buttonPrimary} gap-1.5 self-start px-4 py-2 text-xs sm:self-center`}
          id="btn_quota_upgrade"
        >
          View plans
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

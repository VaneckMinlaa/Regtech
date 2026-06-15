import React from "react";
import { Zap, ArrowRight } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { getPlanById } from "@/domain/billing/plans";

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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
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
                {simLeft} simulation{simLeft > 1 ? "s" : ""} restante{simLeft > 1 ? "s" : ""} ce mois
              </span>
            )}
            {simLeft !== null && classLeft !== null && " · "}
            {classLeft !== null && (
              <span>
                {classLeft} classification{classLeft > 1 ? "s" : ""} IA restante{classLeft > 1 ? "s" : ""}
              </span>
            )}
            {simLeft === null && "Quotas illimités sur votre plan actuel."}
          </p>
        </div>
      </div>
      {(subscription.plan === "free" || lowQuota) && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-500 text-white text-xs font-bold transition-colors"
          id="btn_quota_upgrade"
        >
          Voir les offres
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

import React from "react";
import { Crown } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { getPlanById } from "@/domain/billing/plans";

interface PlanBadgeProps {
  onClick?: () => void;
  darkMode?: boolean;
}

export function PlanBadge({ onClick, darkMode = true }: PlanBadgeProps) {
  const { subscription } = useSubscription();
  const plan = getPlanById(subscription.plan);

  const colors: Record<string, string> = {
    free: darkMode ? "bg-dark-secondary text-gray-300 border-gray-700" : "bg-gray-100 text-gray-600 border-gray-200",
    starter: "bg-primary-400/90 text-white border-primary-300",
    pro: "bg-primary-500 text-white border-primary-400",
    business: "bg-primary-600 text-white border-primary-500",
    enterprise: "bg-primary-700 text-white border-primary-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-opacity hover:opacity-90 ${colors[subscription.plan] ?? colors.free}`}
      id="badge_current_plan"
      title="Gérer l'abonnement"
    >
      <Crown className="w-3 h-3" />
      {plan.name}
    </button>
  );
}

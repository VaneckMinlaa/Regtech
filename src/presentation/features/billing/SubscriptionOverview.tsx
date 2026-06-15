import React from "react";
import { Calendar, MapPin, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { getPlanById } from "@/domain/billing/plans";

interface SubscriptionOverviewProps {
  darkMode?: boolean;
  returnStatus?: string | null;
}

export function SubscriptionOverview({ darkMode = true, returnStatus }: SubscriptionOverviewProps) {
  const { subscription } = useSubscription();
  const plan = getPlanById(subscription.plan);

  const periodEndLabel = subscription.periodEnd
    ? new Date(subscription.periodEnd).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`rounded-xl border p-5 ${
        darkMode ? "bg-gradient-to-br from-dark-primary to-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}
      id="subscription_overview"
    >
      {returnStatus === "success" && (
        <div className="mb-4 flex items-center gap-2 text-xs text-primary-400 bg-primary-950/40 border border-primary-500/30 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          Paiement confirmé — votre plan est actif.
        </div>
      )}
      {returnStatus === "pending" && (
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          Paiement en cours de validation…
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Abonnement actuel
          </p>
          <h2 className={`text-xl font-bold font-display mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Plan {plan.name}
          </h2>
          <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {plan.description}
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            <span>
              {subscription.countryIso} · {subscription.currency}
            </span>
          </div>
          {subscription.provider && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-primary-500" />
              <span>PawaPay</span>
            </div>
          )}
          {periodEndLabel && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              <span>Renouvellement {periodEndLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

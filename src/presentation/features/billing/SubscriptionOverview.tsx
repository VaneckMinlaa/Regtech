import React, { useEffect, useState } from "react";
import { Calendar, MapPin, CreditCard, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { SubscriptionOverviewSkeleton } from "./SubscriptionPageSkeleton";
import { getPlanById } from "@/domain/billing/plans";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { AnalyticsSummaryResponse } from "@/infrastructure/http/regtechApiTypes";

interface SubscriptionOverviewProps {
  darkMode?: boolean;
  returnStatus?: string | null;
}

export function SubscriptionOverview({ darkMode = true, returnStatus }: SubscriptionOverviewProps) {
  const { subscription, loading } = useSubscription();
  const plan = getPlanById(subscription.plan);
  const [analytics, setAnalytics] = useState<AnalyticsSummaryResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    setAnalyticsLoading(true);
    void regtechApi
      .getMonetizationAnalytics()
      .then(setAnalytics)
      .catch(() => undefined)
      .finally(() => setAnalyticsLoading(false));
  }, [subscription.plan]);

  const periodEndLabel = subscription.periodEnd
    ? new Date(subscription.periodEnd).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (loading) {
    return (
      <>
        {returnStatus === "pending" && (
          <div className="mb-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            Payment pending…
          </div>
        )}
        <SubscriptionOverviewSkeleton darkMode={darkMode} />
      </>
    );
  }

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
          Payment confirmed — your plan is active.
        </div>
      )}
      {returnStatus === "pending" && (
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          Payment pending…
        </div>
      )}
      {returnStatus === "failed" && (
        <div className="mb-4 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          Payment could not be confirmed. Please try again or contact support.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Current subscription
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
              <span>Renewal {periodEndLabel}</span>
            </div>
          )}
        </div>
      </div>

      {analyticsLoading ? (
        <div
          className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className={`h-10 rounded-lg animate-pulse ${darkMode ? "bg-gray-800/80" : "bg-gray-200"}`}
            />
          ))}
        </div>
      ) : analytics ? (
        <div
          className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] ${
            darkMode ? "border-gray-800" : "border-gray-100"
          }`}
          id="subscription_analytics"
        >
          <div className="flex items-start gap-2">
            <BarChart3 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{analytics.simulationsCount} simulations</p>
              <p className={darkMode ? "text-gray-500" : "text-gray-500"}>this month</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-primary-400">
              {analytics.afcftaSavingsEstimateLocal.toLocaleString("fr-FR")} XAF
            </p>
            <p className={darkMode ? "text-gray-500" : "text-gray-500"}>estimated AfCFTA savings</p>
          </div>
          <div>
            <p className="font-bold">
              {analytics.topCorridors[0]?.route ?? "—"}
            </p>
            <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
              main corridor ({analytics.topCorridors[0]?.count ?? 0} sims.)
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Calendar, MapPin, CreditCard, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { SubscriptionOverviewSkeleton } from "./SubscriptionPageSkeleton";
import { UsageMeterCard } from "./UsageMeterCard";
import { getPlanById } from "@/domain/billing/plans";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { AnalyticsSummaryResponse } from "@/infrastructure/http/regtechApiTypes";

interface SubscriptionOverviewProps {
  darkMode?: boolean;
  returnStatus?: string | null;
}

function renewalLabel(periodEnd: string | null): { label: string; detail: string } | null {
  if (!periodEnd) return null;
  const end = new Date(periodEnd);
  if (Number.isNaN(end.getTime())) return null;

  const daysUntil = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const formatted = end.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const cycle = daysUntil > 180 ? "Annual" : "Monthly";

  return {
    label: `${cycle} renewal`,
    detail: formatted,
  };
}

export function SubscriptionOverview({ darkMode = true, returnStatus }: SubscriptionOverviewProps) {
  const { subscription, usage, quotas, remaining, loading } = useSubscription();
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

  const renewal = renewalLabel(subscription.periodEnd);

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
          {renewal && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              <span>
                {renewal.label} · {renewal.detail}
              </span>
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
              {analytics.afcftaSavingsEstimateLocal.toLocaleString("en-US")} XAF
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

      <div
        className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
        id="subscription_usage_meters"
      >
        <UsageMeterCard
          label="Tariff simulations"
          used={usage.simulations}
          limit={quotas.simulationsPerMonth}
          remaining={remaining("simulations")}
          darkMode={darkMode}
        />
        <UsageMeterCard
          label="HS classifications"
          used={usage.classifications}
          limit={quotas.classificationsPerMonth}
          remaining={remaining("classifications")}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

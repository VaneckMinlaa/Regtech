import React, { useEffect, useState } from "react";
import { Calendar, MapPin, CreditCard, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { SubscriptionOverviewSkeleton } from "./SubscriptionPageSkeleton";
import { Skeleton } from "@/presentation/components/shared/Skeleton";
import { UsageMeterCard } from "./UsageMeterCard";
import { getPlanById } from "@/domain/billing/plans";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { AnalyticsSummaryResponse } from "@/infrastructure/http/regtechApiTypes";
import { platform } from "@/presentation/theme/platformStyles";

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

function MetaChip({
  icon,
  children,
  darkMode,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-2.5 rounded-xl border p-3 text-[11px] ${
        darkMode ? "border-gray-800 bg-dark-secondary/40 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <span className="mt-0.5 shrink-0 text-primary-500">{icon}</span>
      <div className="min-w-0 leading-snug">{children}</div>
    </div>
  );
}

function StatCard({
  children,
  darkMode,
}: {
  children: React.ReactNode;
  darkMode: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-3.5 ${
        darkMode ? "border-gray-800 bg-dark-secondary/40" : "border-gray-200 bg-gray-50"
      }`}
    >
      {children}
    </div>
  );
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "pending" | "failed";
  children: React.ReactNode;
}) {
  const styles = {
    success: "text-primary-400 bg-primary-950/40 border-primary-500/30",
    pending: "text-amber-300 bg-amber-950/40 border-amber-500/30",
    failed: "text-rose-300 bg-rose-950/40 border-rose-500/30",
  }[tone];

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 leading-relaxed">{children}</span>
    </div>
  );
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
      <div className="space-y-4">
        {returnStatus === "pending" && (
          <StatusBanner tone="pending">Payment pending…</StatusBanner>
        )}
        <SubscriptionOverviewSkeleton darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div
      className={`min-w-0 space-y-5 ${platform.panel(darkMode)} ${platform.panelPadding}`}
      id="subscription_overview"
    >
      {returnStatus === "success" && (
        <div className="flex items-start gap-2 rounded-lg border border-primary-500/30 bg-primary-950/40 px-3 py-2 text-xs text-primary-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 leading-relaxed">Payment confirmed — your plan is active.</span>
        </div>
      )}
      {returnStatus === "pending" && <StatusBanner tone="pending">Payment pending…</StatusBanner>}
      {returnStatus === "failed" && (
        <StatusBanner tone="failed">
          Payment could not be confirmed. Please try again or contact support.
        </StatusBanner>
      )}

      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${platform.textMuted(darkMode)}`}>
          Current subscription
        </p>
        <h2 className={`mt-1 font-display text-xl font-bold sm:text-2xl ${platform.textPrimary(darkMode)}`}>
          Plan {plan.name}
        </h2>
        <p className={`mt-1 text-xs leading-relaxed sm:text-sm ${platform.textMuted(darkMode)}`}>
          {plan.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3">
        <MetaChip icon={<MapPin className="h-4 w-4" />} darkMode={darkMode}>
          <p className="font-semibold">Billing country</p>
          <p className={platform.textMuted(darkMode)}>
            {subscription.countryIso} · {subscription.currency}
          </p>
        </MetaChip>

        {subscription.provider && (
          <MetaChip icon={<CreditCard className="h-4 w-4" />} darkMode={darkMode}>
            <p className="font-semibold">Payment</p>
            <p className={platform.textMuted(darkMode)}>PawaPay</p>
          </MetaChip>
        )}

        {renewal && (
          <MetaChip icon={<Calendar className="h-4 w-4" />} darkMode={darkMode}>
            <p className="font-semibold">{renewal.label}</p>
            <p className={`${platform.textMuted(darkMode)} break-words`}>{renewal.detail}</p>
          </MetaChip>
        )}
      </div>

      {analyticsLoading ? (
        <div
          className={`grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3 ${platform.borderSubtle(darkMode)}`}
        >
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} darkMode={darkMode} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : analytics ? (
        <div
          className={`grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3 ${platform.borderSubtle(darkMode)}`}
          id="subscription_analytics"
        >
          <StatCard darkMode={darkMode}>
            <div className="flex items-start gap-2.5">
              <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
              <div className="min-w-0">
                <p className={`text-sm font-bold ${platform.textPrimary(darkMode)}`}>
                  {analytics.simulationsCount} simulations
                </p>
                <p className={`text-[11px] ${platform.textMuted(darkMode)}`}>this month</p>
              </div>
            </div>
          </StatCard>

          <StatCard darkMode={darkMode}>
            <p className={`text-sm font-bold ${platform.totalAmount(darkMode)}`}>
              {analytics.afcftaSavingsEstimateLocal.toLocaleString("en-US")} XAF
            </p>
            <p className={`mt-0.5 text-[11px] leading-relaxed ${platform.textMuted(darkMode)}`}>
              estimated AfCFTA savings
            </p>
          </StatCard>

          <StatCard darkMode={darkMode}>
            <p className={`text-sm font-bold break-words ${platform.textPrimary(darkMode)}`}>
              {analytics.topCorridors[0]?.route ?? "—"}
            </p>
            <p className={`mt-0.5 text-[11px] leading-relaxed ${platform.textMuted(darkMode)}`}>
              main corridor ({analytics.topCorridors[0]?.count ?? 0} sims.)
            </p>
          </StatCard>
        </div>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-3 border-t pt-5 md:grid-cols-2 ${platform.borderSubtle(darkMode)}`}
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

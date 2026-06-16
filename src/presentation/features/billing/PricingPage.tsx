import React, { useEffect, useState } from "react";
import {
  Check,
  Globe,
  Smartphone,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";
import type { PlanId, PawapayCountry } from "@/domain/billing/types";
import { PRICING_PLANS, PAWAPAY_COUNTRIES } from "@/domain/billing/plans";
import type { PricingPlan } from "@/domain/billing/types";
import type { PlanPriceItem } from "@/infrastructure/http/regtechApiTypes";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { mergeApiPlansWithPricing } from "@/infrastructure/http/monetizationMapper";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { formatPlanAmount } from "./formatPlanAmount";
import { SubscriptionOverview } from "./SubscriptionOverview";
import { SubscriptionPageSkeleton } from "./SubscriptionPageSkeleton";
import { ReferenceVersionsFooter } from "./ReferenceVersionsFooter";
import { platform } from "@/presentation/theme/platformStyles";

interface PricingPageProps {
  darkMode?: boolean;
  returnStatus?: string | null;
}

export function PricingPage({ darkMode = true, returnStatus }: PricingPageProps) {
  const {
    subscription,
    billingCountry,
    setBillingCountryIso,
    startCheckout,
    loading,
  } = useSubscription();
  const [yearly, setYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [paidPlans, setPaidPlans] = useState<PricingPlan[]>(() =>
    PRICING_PLANS.filter((p) => p.id !== "free" && p.id !== "enterprise"),
  );
  const [billingCountries, setBillingCountries] = useState<PawapayCountry[]>(PAWAPAY_COUNTRIES);
  const [planPrices, setPlanPrices] = useState<Record<string, PlanPriceItem>>({});
  const [planPricesLoading, setPlanPricesLoading] = useState(false);

  const selectedCountry =
    billingCountries.find((c) => c.code === billingCountry.code) ?? billingCountry;
  const checkoutAllowed = selectedCountry.checkoutEnabled !== false;

  useEffect(() => {
    void regtechApi
      .getBillingCountries()
      .then((remote) => {
        if (remote.length === 0) return;
        setBillingCountries(
          remote.map((item) => {
            const local = PAWAPAY_COUNTRIES.find((c) => c.code === item.code);
            return {
              code: item.code,
              name: local?.name ?? item.name,
              currency: item.currency,
              pawapaySupported: true,
              checkoutEnabled: item.checkoutEnabled,
              operators: local?.operators ?? [],
            };
          }),
        );
      })
      .catch(() => {
        /* garde la liste locale */
      });
  }, []);

  useEffect(() => {
    setPlanPricesLoading(true);
    void regtechApi
      .getBillingPlanPrices(selectedCountry.code)
      .then((response) => {
        setPlanPrices(Object.fromEntries(response.plans.map((plan) => [plan.plan, plan])));
      })
      .catch(() => setPlanPrices({}))
      .finally(() => setPlanPricesLoading(false));
  }, [selectedCountry.code]);

  useEffect(() => {
    void regtechApi
      .getMonetizationPlans()
      .then((apiPlans) => {
        const merged = mergeApiPlansWithPricing(apiPlans).filter(
          (p) => p.id !== "free" && p.id !== "enterprise",
        );
        if (merged.length > 0) setPaidPlans(merged);
      })
      .catch(() => {
        /* garde les plans locaux */
      });
  }, []);

  const handleCheckout = async (planId: PlanId) => {
    if (planId === "free" || planId === "enterprise") return;
    if (!selectedCountry.pawapaySupported) {
      setCheckoutError(
        `${selectedCountry.name} is not covered by PawaPay. Choose another billing country.`,
      );
      return;
    }
    if (!checkoutAllowed) {
      setCheckoutError(
        `Payments from ${selectedCountry.name} are not yet enabled on your PawaPay merchant account. ` +
          "Request country enablement in the PawaPay dashboard, or pick another enabled country (e.g., Cameroon, Ghana, Kenya).",
      );
      return;
    }

    setCheckoutError("");
    setLoadingPlan(planId);
    try {
      const response = await startCheckout({
        plan: planId,
        countryIso: selectedCountry.code,
        billingPeriod: yearly ? "annual" : "monthly",
      });

      localStorage.setItem("regtech_pending_plan", planId);
      window.location.href = response.paymentPageUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout error");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading && !returnStatus) {
    return <SubscriptionPageSkeleton darkMode={darkMode} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn" id="pricing_page">
      <SubscriptionOverview darkMode={darkMode} returnStatus={returnStatus} />

      <div className={`${platform.panel(darkMode)} ${platform.panelPadding}`}>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className={platform.pageTitle(darkMode)}>Plans & billing</h2>
            <p className={platform.pageSubtitle(darkMode)}>
              Mobile Money checkout via PawaPay across 20 African countries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={billingCountry.code}
              onChange={(e) => setBillingCountryIso(e.target.value)}
              className={`${platform.input(darkMode)} max-w-xs text-sm`}
              id="select_billing_country"
            >
              {billingCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                  {c.checkoutEnabled === false ? " — activation required" : ""}
                </option>
              ))}
            </select>

            <div className={platform.segmentTrack(darkMode)}>
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={!yearly ? platform.segmentActive : platform.segmentInactive(darkMode)}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`flex items-center gap-2 pr-2 ${yearly ? platform.segmentActive : platform.segmentInactive(darkMode)}`}
              >
                Annual
                <span className="rounded-full bg-orange-400 px-2 py-0.5 text-xs text-white">−20%</span>
              </button>
            </div>
          </div>
        </div>

        {!checkoutAllowed && (
          <div
            className={`mb-4 text-xs rounded-lg border px-3 py-2 ${
              darkMode ? "border-amber-500/30 bg-amber-950/30 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {selectedCountry.name} is not yet enabled on your PawaPay merchant account.
            Enable this country in the{" "}
            <a
              href="https://dashboard.pawapay.io/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-primary-400"
            >
              PawaPay dashboard
            </a>{" "}
            (Providers section), or pick another enabled country.
          </div>
        )}

        {checkoutError && (
          <p className="text-xs text-rose-400 mb-4" role="alert">
            {checkoutError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {paidPlans.map((plan) => {
            const priceXaf = yearly ? plan.priceXafYearly : plan.priceXafMonthly;
            const apiPrice = planPrices[plan.id];
            const localAmount = apiPrice
              ? yearly
                ? apiPrice.amountYearly
                : apiPrice.amountMonthly
              : null;
            const isCurrent = subscription.plan === plan.id;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={platform.pricingCard(darkMode, !!isHighlighted)}
                id={`pricing_card_${plan.id}`}
              >
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-lg font-semibold ${platform.textPrimary(darkMode)}`}>
                      {plan.name}
                    </h3>
                    {isHighlighted && (
                      <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-500 dark:bg-primary-500/15">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className={`mt-3 text-sm ${platform.textMuted(darkMode)}`}>{plan.description}</p>
                  <p className={`mt-4 flex items-baseline font-display text-3xl font-bold ${platform.textPrimary(darkMode)}`}>
                    {planPricesLoading ? (
                      <span
                        className={`inline-block h-9 w-28 animate-pulse rounded-full ${
                          darkMode ? "bg-gray-800/80" : "bg-gray-200"
                        }`}
                      />
                    ) : localAmount != null && apiPrice ? (
                      formatPlanAmount(localAmount, apiPrice.currency)
                    ) : (
                      <span className="text-base font-semibold text-rose-400">Unavailable</span>
                    )}
                    <span className={`ml-1 text-sm font-normal ${platform.textMuted(darkMode)}`}>
                      /{yearly ? "year" : "month"}
                    </span>
                  </p>
                  <p className={`mt-1 text-xs ${platform.textMuted(darkMode)}`}>
                    ≈ {priceXaf.toLocaleString("en-US")} FCFA
                  </p>

                  <ul className={`mt-6 flex-1 space-y-3 text-sm ${platform.textSecondary(darkMode)}`}>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      {plan.quotas.simulationsPerMonth ?? "∞"} simulations / month
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      {plan.quotas.classificationsPerMonth ?? "∞"} AI classifications
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      {plan.quotas.pdfExport ? "PDF export" : "—"}
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      {plan.quotas.checklist ? "Cameroon checklist" : "—"}
                    </li>
                  </ul>

                  <button
                    type="button"
                    disabled={isCurrent || loadingPlan !== null || !checkoutAllowed}
                    onClick={() => void handleCheckout(plan.id)}
                    className={`mt-6 w-full py-3 text-sm font-medium ${
                      isCurrent
                        ? platform.buttonDark + " cursor-default"
                        : isHighlighted
                          ? platform.buttonGradient
                          : platform.buttonDark
                    }`}
                    id={`btn_subscribe_${plan.id}`}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      "Active plan"
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Pay via MoMo
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`mt-6 flex flex-wrap gap-4 text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}
        >
          <span className="inline-flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> 20 PawaPay countries
          </span>
          <span className="inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Secure payment
          </span>
          <a
            href="https://docs.pawapay.io/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-primary-500"
          >
            API docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <ReferenceVersionsFooter darkMode={darkMode} />
      </div>
    </div>
  );
}

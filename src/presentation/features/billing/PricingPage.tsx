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

      <div
        className={`rounded-xl border p-6 ${
          darkMode ? "bg-dark-primary/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-lg font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
              RegTech offers
            </h2>
            <p className={`text-xs mt-1 max-w-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Mobile Money payments via <strong>PawaPay</strong> — 20 African countries (MoMo).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className={`text-[10px] font-bold uppercase ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Billing country
            </label>
            <select
              value={billingCountry.code}
              onChange={(e) => setBillingCountryIso(e.target.value)}
              className={`text-xs rounded-lg border px-3 py-2 font-mono ${
                darkMode
                  ? "bg-[#101828] border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
              id="select_billing_country"
            >
              {billingCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                  {c.checkoutEnabled === false ? " — activation required" : ""}
                </option>
              ))}
            </select>

            <div
              className={`flex rounded-lg border p-0.5 text-[10px] font-bold ${
                darkMode ? "border-gray-700 bg-[#101828]" : "border-gray-200 bg-gray-50"
              }`}
            >
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`px-3 py-1.5 rounded-md ${!yearly ? "bg-primary-500 text-white" : darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`px-3 py-1.5 rounded-md ${yearly ? "bg-primary-500 text-white" : darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Annual −20%
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={`relative rounded-xl border p-5 flex flex-col ${
                  isHighlighted
                    ? darkMode
                      ? "border-primary-500/50 bg-primary-950/20 ring-1 ring-primary-500/30"
                      : "border-primary-300 bg-primary-50/50 ring-1 ring-primary-200"
                    : darkMode
                      ? "border-gray-800 bg-[#101828]/50"
                      : "border-gray-200 bg-gray-50/50"
                }`}
                id={`pricing_card_${plan.id}`}
              >
                {isHighlighted && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-primary-500 text-white">
                    Popular
                  </span>
                )}
                <h3 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-[11px] mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {plan.description}
                </p>
                <p className={`text-2xl font-extrabold font-display mt-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {planPricesLoading ? (
                    <span
                      className={`inline-block h-8 w-28 rounded animate-pulse ${
                        darkMode ? "bg-gray-800/80" : "bg-gray-200"
                      }`}
                    />
                  ) : localAmount != null && apiPrice ? (
                    formatPlanAmount(localAmount, apiPrice.currency)
                  ) : (
                    <span className="text-base font-semibold text-rose-400">Price unavailable</span>
                  )}
                  <span className={`text-xs font-normal ml-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    /{yearly ? "year" : "month"}
                  </span>
                </p>
                <p className={`text-[10px] font-mono mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  ≈ {priceXaf.toLocaleString("en-US")} FCFA
                </p>

                <ul className={`mt-4 space-y-2 text-[11px] flex-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    {plan.quotas.simulationsPerMonth ?? "∞"} simulations / month
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    {plan.quotas.classificationsPerMonth ?? "∞"} AI classifications
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    {plan.quotas.pdfExport ? "Export PDF" : "—"}
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    {plan.quotas.checklist ? "Cameroon checklist" : "—"}
                  </li>
                </ul>

                <button
                  type="button"
                  disabled={isCurrent || loadingPlan !== null || !checkoutAllowed}
                  onClick={() => void handleCheckout(plan.id)}
                  className={`mt-5 w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    isCurrent
                      ? "bg-gray-700 text-gray-400 cursor-default"
                      : isHighlighted
                        ? "bg-primary-500 hover:bg-primary-500 text-white"
                        : darkMode
                          ? "bg-dark-secondary hover:bg-gray-700 text-white"
                          : "bg-dark-primary hover:bg-dark-secondary text-white"
                  }`}
                  id={`btn_subscribe_${plan.id}`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "Active plan"
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      Pay via MoMo
                    </>
                  )}
                </button>
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

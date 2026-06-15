import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  CheckoutRequest,
  CheckoutResponse,
  PlanId,
  SubscriptionState,
  UsageCounters,
} from "@/domain/billing/types";
import { currentYearMonth, getPlanById, PAWAPAY_COUNTRIES } from "@/domain/billing/plans";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import {
  buildQuotaExhaustedAlert,
  type QuotaAlert,
  type QuotaUsageField,
} from "@/presentation/features/billing/quotaNotifications";

const STORAGE_KEY = "regtech_subscription_v1";
const USAGE_KEY = "regtech_usage_v1";

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  usage: UsageCounters;
  loading: boolean;
  billingCountry: (typeof PAWAPAY_COUNTRIES)[number];
  setBillingCountryIso: (code: string) => void;
  refreshSubscription: () => Promise<void>;
  recordUsage: (field: keyof Omit<UsageCounters, "yearMonth">, amount?: number) => void;
  canUse: (field: keyof Omit<UsageCounters, "yearMonth">, amount?: number) => boolean;
  remaining: (field: keyof Omit<UsageCounters, "yearMonth">) => number | null;
  quotaAlert: QuotaAlert | null;
  dismissQuotaAlert: () => void;
  startCheckout: (request: CheckoutRequest) => Promise<CheckoutResponse>;
  activatePlanDemo: (plan: PlanId) => void;
}

const defaultSubscription: SubscriptionState = {
  plan: "free",
  status: "active",
  provider: null,
  countryIso: "CMR",
  currency: "XAF",
  periodEnd: null,
};

const defaultUsage: UsageCounters = {
  simulations: 0,
  classifications: 0,
  batchRows: 0,
  pdfExports: 0,
  yearMonth: currentYearMonth(),
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function loadStoredSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSubscription;
    return { ...defaultSubscription, ...JSON.parse(raw) };
  } catch {
    return defaultSubscription;
  }
}

function loadStoredUsage(): UsageCounters {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return defaultUsage;
    const parsed = JSON.parse(raw) as UsageCounters;
    if (parsed.yearMonth !== currentYearMonth()) return { ...defaultUsage, yearMonth: currentYearMonth() };
    return parsed;
  } catch {
    return defaultUsage;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(loadStoredSubscription);
  const [usage, setUsage] = useState<UsageCounters>(loadStoredUsage);
  const [loading, setLoading] = useState(true);
  const [billingCountryIso, setBillingCountryIso] = useState(subscription.countryIso);
  const [quotaAlert, setQuotaAlert] = useState<QuotaAlert | null>(null);

  const dismissQuotaAlert = useCallback(() => setQuotaAlert(null), []);

  const billingCountry = useMemo(
    () => PAWAPAY_COUNTRIES.find((c) => c.code === billingCountryIso) ?? PAWAPAY_COUNTRIES[0],
    [billingCountryIso],
  );

  const persistSubscription = useCallback((next: SubscriptionState) => {
    setSubscription(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const persistUsage = useCallback((next: UsageCounters) => {
    setUsage(next);
    localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const remote = await regtechApi.getSubscription();
      persistSubscription(remote);
      setBillingCountryIso(remote.countryIso);
    } catch {
      /* API billing pas encore déployée — état local conservé */
    } finally {
      setLoading(false);
    }
  }, [persistSubscription]);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  const plan = useMemo(() => getPlanById(subscription.plan), [subscription.plan]);

  const getQuotaLimit = useCallback(
    (field: QuotaUsageField): number | null | undefined => {
      const limits: Record<string, number | null | undefined> = {
        simulations: plan.quotas.simulationsPerMonth,
        classifications: plan.quotas.classificationsPerMonth,
        batchRows: plan.quotas.batchRows,
        pdfExports: plan.quotas.pdfExport ? null : 0,
      };
      return limits[field];
    },
    [plan],
  );

  const canUse = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">, amount = 1): boolean => {
      const limits: Record<string, number | null | undefined> = {
        simulations: plan.quotas.simulationsPerMonth,
        classifications: plan.quotas.classificationsPerMonth,
        batchRows: plan.quotas.batchRows,
        pdfExports: plan.quotas.pdfExport ? null : 0,
      };
      const limit = limits[field];
      if (limit === null || limit === undefined) return true;
      if (limit === 0) return false;
      return usage[field] + amount <= limit;
    },
    [plan, usage],
  );

  const remaining = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">): number | null => {
      const limits: Record<string, number | null | undefined> = {
        simulations: plan.quotas.simulationsPerMonth,
        classifications: plan.quotas.classificationsPerMonth,
        batchRows: plan.quotas.batchRows,
        pdfExports: plan.quotas.pdfExport ? null : 0,
      };
      const limit = limits[field];
      if (limit === null || limit === undefined) return null;
      return Math.max(0, limit - usage[field]);
    },
    [plan, usage],
  );

  const recordUsage = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">, amount = 1) => {
      const ym = currentYearMonth();
      const base = usage.yearMonth === ym ? usage : { ...defaultUsage, yearMonth: ym };
      const newValue = base[field] + amount;
      persistUsage({ ...base, [field]: newValue });

      const limit = getQuotaLimit(field);
      if (limit !== null && limit !== undefined && limit > 0 && newValue >= limit) {
        setQuotaAlert(buildQuotaExhaustedAlert(field));
      }
    },
    [usage, persistUsage, getQuotaLimit],
  );

  const startCheckout = useCallback(
    async (request: CheckoutRequest): Promise<CheckoutResponse> => {
      try {
        return await regtechApi.startCheckout(request);
      } catch {
        const country = PAWAPAY_COUNTRIES.find((c) => c.code === request.countryIso) ?? PAWAPAY_COUNTRIES[0];
        const planDef = getPlanById(request.plan);
        const depositId = crypto.randomUUID();
        const returnUrl = `${window.location.origin}${window.location.pathname}?billing=return&status=pending&depositId=${depositId}`;
        return {
          depositId,
          paymentPageUrl: `https://dashboard.sandbox.pawapay.io/demo?plan=${request.plan}&country=${request.countryIso}&return=${encodeURIComponent(returnUrl)}`,
          amount: planDef.priceXafMonthly,
          currency: country.currency,
          countryIso: request.countryIso,
          correspondent: country.operators[0],
        };
      }
    },
    [],
  );

  const activatePlanDemo = useCallback(
    (planId: PlanId) => {
      const country = PAWAPAY_COUNTRIES.find((c) => c.code === billingCountryIso) ?? PAWAPAY_COUNTRIES[0];
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      persistSubscription({
        plan: planId,
        status: "active",
        provider: "pawapay",
        countryIso: country.code,
        currency: country.currency,
        periodEnd: periodEnd.toISOString(),
      });
    },
    [billingCountryIso, persistSubscription],
  );

  const value = useMemo(
    () => ({
      subscription,
      usage,
      loading,
      billingCountry,
      setBillingCountryIso,
      refreshSubscription,
      recordUsage,
      canUse,
      remaining,
      quotaAlert,
      dismissQuotaAlert,
      startCheckout,
      activatePlanDemo,
    }),
    [
      subscription,
      usage,
      loading,
      billingCountry,
      refreshSubscription,
      recordUsage,
      canUse,
      remaining,
      quotaAlert,
      dismissQuotaAlert,
      startCheckout,
      activatePlanDemo,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@clerk/react";
import type {
  CheckoutRequest,
  CheckoutResponse,
  PlanId,
  PlanQuotas,
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

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  usage: UsageCounters;
  quotas: PlanQuotas;
  loading: boolean;
  apiLinked: boolean;
  billingCountry: (typeof PAWAPAY_COUNTRIES)[number];
  setBillingCountryIso: (code: string) => void;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
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

function quotaLimitForField(quotas: PlanQuotas, field: QuotaUsageField): number | null | undefined {
  const limits: Record<string, number | null | undefined> = {
    simulations: quotas.simulationsPerMonth,
    classifications: quotas.classificationsPerMonth,
    batchRows: quotas.batchRows,
    pdfExports: quotas.pdfExport ? null : 0,
  };
  return limits[field];
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(loadStoredSubscription);
  const [usage, setUsage] = useState<UsageCounters>(defaultUsage);
  const [quotas, setQuotas] = useState<PlanQuotas>(getPlanById("free").quotas);
  const [loading, setLoading] = useState(true);
  const [apiLinked, setApiLinked] = useState(false);
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

  const refreshUsage = useCallback(async () => {
    try {
      const remoteUsage = await regtechApi.getUsage();
      setUsage(remoteUsage);
      setApiLinked(true);
    } catch {
      /* conserve l'usage en mémoire si l'API est indisponible */
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const snapshot = await regtechApi.getMonetizationSnapshot();
      persistSubscription(snapshot.subscription);
      setQuotas(snapshot.quotas);
      setUsage(snapshot.usage);
      setBillingCountryIso(snapshot.subscription.countryIso);
      setApiLinked(true);
    } catch {
      setQuotas(getPlanById(loadStoredSubscription().plan).quotas);
      setApiLinked(false);
    } finally {
      setLoading(false);
    }
  }, [persistSubscription]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setQuotas(getPlanById(loadStoredSubscription().plan).quotas);
      setApiLinked(false);
      setLoading(false);
      return;
    }
    void refreshSubscription();
  }, [isLoaded, isSignedIn, refreshSubscription]);

  const canUse = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">, amount = 1): boolean => {
      const limit = quotaLimitForField(quotas, field as QuotaUsageField);
      if (limit === null || limit === undefined) return true;
      if (limit === 0) return false;
      return usage[field] + amount <= limit;
    },
    [quotas, usage],
  );

  const remaining = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">): number | null => {
      const limit = quotaLimitForField(quotas, field as QuotaUsageField);
      if (limit === null || limit === undefined) return null;
      return Math.max(0, limit - usage[field]);
    },
    [quotas, usage],
  );

  const recordUsage = useCallback(
    (field: keyof Omit<UsageCounters, "yearMonth">) => {
      void (async () => {
        try {
          const remoteUsage = await regtechApi.getUsage();
          setUsage(remoteUsage);
          setApiLinked(true);
          const limit = quotaLimitForField(quotas, field as QuotaUsageField);
          if (
            limit !== null &&
            limit !== undefined &&
            limit > 0 &&
            remoteUsage[field] >= limit
          ) {
            setQuotaAlert(buildQuotaExhaustedAlert(field as QuotaUsageField));
          }
        } catch {
          /* API indisponible — pas de toast quota */
        }
      })();
    },
    [quotas],
  );

  const startCheckout = useCallback(
    (request: CheckoutRequest): Promise<CheckoutResponse> => regtechApi.startCheckout(request),
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
      setQuotas(getPlanById(planId).quotas);
    },
    [billingCountryIso, persistSubscription],
  );

  const value = useMemo(
    () => ({
      subscription,
      usage,
      quotas,
      loading,
      apiLinked,
      billingCountry,
      setBillingCountryIso,
      refreshSubscription,
      refreshUsage,
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
      quotas,
      loading,
      apiLinked,
      billingCountry,
      refreshSubscription,
      refreshUsage,
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

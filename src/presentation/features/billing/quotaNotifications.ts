import type { UsageCounters } from "@/domain/billing/types";

export type QuotaUsageField = keyof Omit<UsageCounters, "yearMonth">;

export const QUOTA_MODULE_LABELS: Record<QuotaUsageField, string> = {
  simulations: "Tariff simulator",
  classifications: "HS classification",
  batchRows: "Batch processing",
  pdfExports: "Export PDF",
};

export interface QuotaAlert {
  field: QuotaUsageField;
  message: string;
  title: string;
}

export function buildQuotaExhaustedAlert(field: QuotaUsageField): QuotaAlert {
  const module = QUOTA_MODULE_LABELS[field];
  return {
    field,
    title: "All attempts used",
    message: `You have used all your attempts for the module “${module}” this month. Upgrade to a higher plan to continue.`,
  };
}

import type { UsageCounters } from "@/domain/billing/types";

export type QuotaUsageField = keyof Omit<UsageCounters, "yearMonth">;

export const QUOTA_MODULE_LABELS: Record<QuotaUsageField, string> = {
  simulations: "Simulateur tarifaire",
  classifications: "Classification HS",
  batchRows: "Traitement par lot",
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
    title: "Essais terminés",
    message: `Vous avez utilisé tous vos essais du module « ${module} » pour ce mois. Passez à un plan supérieur pour continuer.`,
  };
}

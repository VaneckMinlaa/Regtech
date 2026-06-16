const INTEGER_CURRENCIES = new Set(["XAF", "XOF", "NGN", "KES", "RWF", "UGX", "TZS", "MWK"]);

export function formatPlanAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: INTEGER_CURRENCIES.has(currency) ? 0 : 2,
  }).format(amount);
}

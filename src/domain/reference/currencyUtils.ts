/** Convertit un montant entre deux devises via un pivot USD (units_per_usd). */
export function convertBetweenCurrencies(
  amount: number,
  originRateToUsd: number,
  destRateToUsd: number,
): number {
  if (amount <= 0 || originRateToUsd <= 0 || destRateToUsd <= 0) return 0;
  const usd = amount / originRateToUsd;
  return usd * destRateToUsd;
}

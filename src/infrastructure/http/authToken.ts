/** Fournit le jeton Clerk aux appels HTTP (enregistre par ClerkTokenBridge). */
let getAuthToken: (() => Promise<string | null>) | null = null;

export function registerAuthTokenGetter(
  getter: () => Promise<string | null>,
): void {
  getAuthToken = getter;
}

export async function resolveAuthToken(): Promise<string | null> {
  if (!getAuthToken) return null;
  return getAuthToken();
}

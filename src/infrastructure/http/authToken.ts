/** Fournit le jeton Clerk aux appels HTTP (enregistre par ClerkTokenBridge). */
let getAuthToken: (() => Promise<string | null>) | null = null;

const sleep = (ms: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, ms);
});

export function registerAuthTokenGetter(
  getter: () => Promise<string | null>,
): void {
  getAuthToken = getter;
}

/** Attend que Clerk expose un JWT (course au chargement de session). */
export async function resolveAuthToken(
  maxAttempts = 10,
  delayMs = 300,
): Promise<string | null> {
  if (!getAuthToken) return null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const token = await getAuthToken();
    if (token) return token;
    if (attempt < maxAttempts - 1) {
      await sleep(delayMs);
    }
  }
  return null;
}

import { resolveAuthToken } from "./authToken";

const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!RAW_API_BASE) return normalizedPath;

  const normalizedBase = RAW_API_BASE.replace(/\/+$/, "");
  // Guard against duplicated prefix when env already includes /api/v1.
  if (normalizedBase.endsWith("/api/v1") && normalizedPath.startsWith("/api/v1/")) {
    return `${normalizedBase}${normalizedPath.slice("/api/v1".length)}`;
  }
  if (normalizedBase.endsWith("/api/v1") && normalizedPath === "/api/v1") {
    return normalizedBase;
  }
  return `${normalizedBase}${normalizedPath}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function buildHeaders(authenticated: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated) {
    const token = await resolveAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

function parseApiError(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const payload = body as { detail?: string; error?: string };
    if (typeof payload.detail === "string") return payload.detail;
    if (typeof payload.error === "string") return payload.error;
  }
  return status === 401
    ? "Session expirée ou non authentifiée."
    : "Erreur lors de l'appel API.";
}

export async function apiGet<T>(
  path: string,
  authenticated = false,
  timeoutMs = 15_000,
): Promise<T> {
  const headers = await buildHeaders(authenticated);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(buildApiUrl(path), {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(parseApiError(body, res.status), res.status);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Delai depasse lors de l'appel API.", 408);
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  authenticated = true,
  timeoutMs = 60_000,
): Promise<T> {
  const headers = await buildHeaders(authenticated);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(buildApiUrl(path), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new ApiError(parseApiError(payload, res.status), res.status);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Delai depasse lors de l'appel API.", 408);
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

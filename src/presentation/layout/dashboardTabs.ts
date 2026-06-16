/** Onglets du workspace dashboard — persistance via ?tab= */

export const DASHBOARD_TABS = [
  "SIM",
  "IA",
  "AFT",
  "CSV",
  "HIST",
  "CMR",
  "CHECKLIST",
  "PRICING",
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const TAB_SET = new Set<string>(DASHBOARD_TABS);

export function isDashboardTab(value: string | null | undefined): value is DashboardTab {
  return typeof value === "string" && TAB_SET.has(value.toUpperCase());
}

export function readDashboardTabFromUrl(): DashboardTab {
  const params = new URLSearchParams(window.location.search);
  const billing = params.get("billing");
  const depositId = params.get("depositId");
  if (billing === "return" || depositId) {
    return "PRICING";
  }
  const tab = params.get("tab")?.toUpperCase();
  return isDashboardTab(tab) ? tab : "SIM";
}

export function writeDashboardTabToUrl(tab: DashboardTab): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("billing");
  url.searchParams.delete("depositId");
  url.searchParams.delete("status");
  if (tab === "SIM") {
    url.searchParams.delete("tab");
  } else {
    url.searchParams.set("tab", tab.toLowerCase());
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next);
}

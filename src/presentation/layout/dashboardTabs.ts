/** Onglets du workspace dashboard — persistance via ?tab= */

import type { SimulationResult } from "@/domain/reference/types";

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

export function readHistoryIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab")?.toUpperCase() !== "HIST") return null;
  return params.get("id");
}

export function writeHistoryIdToUrl(id: string | null, mode: "push" | "replace" = "push"): void {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", "hist");
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (mode === "push") window.history.pushState({}, "", next);
  else window.history.replaceState({}, "", next);
}

export type SimulatorView = "form" | "estimate" | "certificate";

const SIMULATOR_VIEWS = new Set<string>(["estimate", "certificate"]);

export function readSimulatorViewFromUrl(): SimulatorView {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab")?.toUpperCase();
  if (tab && tab !== "SIM") return "form";
  const view = params.get("view")?.toLowerCase();
  if (view && SIMULATOR_VIEWS.has(view)) return view as SimulatorView;
  return "form";
}

export function writeSimulatorViewToUrl(view: SimulatorView, mode: "push" | "replace" = "push"): void {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", "sim");
  if (view === "form") url.searchParams.delete("view");
  else url.searchParams.set("view", view);
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (mode === "push") window.history.pushState({}, "", next);
  else window.history.replaceState({}, "", next);
}

const LAST_SIMULATION_KEY = "regtech_last_simulation";

export function persistLastSimulation(result: SimulationResult): void {
  try {
    sessionStorage.setItem(LAST_SIMULATION_KEY, JSON.stringify(result));
  } catch {
    /* quota / private mode */
  }
}

export function readLastSimulation(): SimulationResult | null {
  try {
    const raw = sessionStorage.getItem(LAST_SIMULATION_KEY);
    return raw ? (JSON.parse(raw) as SimulationResult) : null;
  } catch {
    return null;
  }
}

export function writeDashboardTabToUrl(tab: DashboardTab): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("billing");
  url.searchParams.delete("depositId");
  url.searchParams.delete("status");
  url.searchParams.delete("id");
  url.searchParams.delete("view");
  if (tab === "SIM") {
    url.searchParams.delete("tab");
  } else {
    url.searchParams.set("tab", tab.toLowerCase());
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next);
}

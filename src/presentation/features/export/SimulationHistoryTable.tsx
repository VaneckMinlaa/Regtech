import React, { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  ChevronRight,
  Download,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import type { Country } from "@/domain/reference/types";
import {
  TaskListEmpty,
  TaskListFooter,
  TaskListGroup,
  TaskListHeader,
  TaskListItem,
  TaskListMeta,
  TaskListShell,
  TaskListTab,
  TaskListTag,
} from "@/presentation/components/shared/PlatformTaskList";
import { platform } from "@/presentation/theme/platformStyles";

type StatusFilter = "all" | "preferential" | "standard" | "excluded";
type SortKey = "date" | "product" | "totalTax";

interface SimulationHistoryTableProps {
  items: SimulationResult[];
  countries: Country[];
  loading?: boolean;
  darkMode?: boolean;
  onViewDetail: (sim: SimulationResult) => void;
  onRefresh: () => void;
}

const PAGE_SIZES = [10, 25, 50] as const;

function statusOf(sim: SimulationResult): StatusFilter {
  if (sim.sensitiveExclusion) return "excluded";
  return sim.isEligiblePrefAfCFTA ? "preferential" : "standard";
}

function statusLabel(sim: SimulationResult): { text: string; tone: "success" | "warning" | "neutral" } {
  const s = statusOf(sim);
  if (s === "preferential") return { text: "Preferential", tone: "success" };
  if (s === "excluded") return { text: "Excluded", tone: "neutral" };
  return { text: "Standard", tone: "warning" };
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfWeek) return "This week";
  if (date >= startOfMonth) return "Earlier this month";
  return "Older";
}

function downloadCsv(rows: SimulationResult[], countries: Country[]) {
  const header = [
    "ID",
    "Date",
    "Year",
    "Product",
    "Origin",
    "Destination",
    "HS Code",
    "Total tax (local)",
    "Status",
  ];
  const lines = rows.map((sim) => {
    const origin = countries.find((c) => c.code === sim.origin)?.name ?? sim.origin;
    const dest = countries.find((c) => c.code === sim.destination)?.name ?? sim.destination;
    const status = statusLabel(sim).text;
    return [
      sim.id,
      sim.date,
      String(sim.year),
      `"${sim.productDescription.replace(/"/g, '""')}"`,
      origin,
      dest,
      sim.hsCode,
      String(sim.totalTaxLocal),
      status,
    ].join(",");
  });
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `regtech_simulations_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SimulationHistoryTable({
  items,
  countries,
  loading = false,
  darkMode = true,
  onViewDetail,
  onRefresh,
}: SimulationHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOpen, setSortOpen] = useState(false);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25);
  const [page, setPage] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const countryName = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

  const counts = useMemo(
    () => ({
      all: items.length,
      preferential: items.filter((s) => statusOf(s) === "preferential").length,
      standard: items.filter((s) => statusOf(s) === "standard").length,
      excluded: items.filter((s) => statusOf(s) === "excluded").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((sim) => {
      if (statusFilter !== "all" && statusOf(sim) !== statusFilter) return false;
      if (!q) return true;
      const origin = countryName(sim.origin).toLowerCase();
      const dest = countryName(sim.destination).toLowerCase();
      return (
        sim.id.toLowerCase().includes(q) ||
        sim.productDescription.toLowerCase().includes(q) ||
        sim.hsCode.toLowerCase().includes(q) ||
        origin.includes(q) ||
        dest.includes(q) ||
        String(sim.year).includes(q)
      );
    });
  }, [items, search, statusFilter, countries]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      switch (sortKey) {
        case "product":
          return a.productDescription.localeCompare(b.productDescription);
        case "totalTax":
          return b.totalTaxLocal - a.totalTaxLocal;
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    return list;
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const groups = useMemo(() => {
    const map = new Map<string, SimulationResult[]>();
    const order = ["This week", "Earlier this month", "Older"];
    for (const sim of paginated) {
      const key = groupLabel(sim.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(sim);
    }
    return order.filter((k) => map.has(k)).map((k) => ({ label: k, items: map.get(k)! }));
  }, [paginated]);

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All simulations" },
    { key: "preferential", label: "Preferential" },
    { key: "standard", label: "Standard" },
    { key: "excluded", label: "Excluded" },
  ];

  return (
    <div className="space-y-4" id="simulation_history_table">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${platform.textMuted(darkMode)}`}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search simulations…"
            className={`${platform.input(darkMode)} pl-9 text-sm`}
          />
        </div>
      </div>

      <TaskListShell darkMode={darkMode}>
        <TaskListHeader
          darkMode={darkMode}
          tabs={tabs.map((tab) => (
            <TaskListTab
              key={tab.key}
              label={tab.label}
              count={counts[tab.key]}
              active={statusFilter === tab.key}
              darkMode={darkMode}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(0);
              }}
            />
          ))}
          actions={
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort
                </button>
                {sortOpen && (
                  <div
                    className={`absolute right-0 z-10 mt-2 min-w-[10rem] rounded-xl border py-1 shadow-lg ${
                      darkMode ? "border-gray-700 bg-dark-secondary" : "border-gray-200 bg-white"
                    }`}
                  >
                    {(
                      [
                        ["date", "Newest first"],
                        ["product", "Product A–Z"],
                        ["totalTax", "Highest tax"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSortKey(key);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${
                          sortKey === key
                            ? darkMode
                              ? "bg-primary-500/15 text-primary-300"
                              : "bg-primary-50 text-primary-700"
                            : darkMode
                              ? "text-gray-300 hover:bg-white/5"
                              : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const rows =
                    checked.size > 0 ? sorted.filter((sim) => checked.has(sim.id)) : sorted;
                  downloadCsv(rows, countries);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </button>
            </>
          }
        />

        {paginated.length === 0 ? (
          <TaskListEmpty darkMode={darkMode}>No simulations match your filters.</TaskListEmpty>
        ) : (
          groups.map((group) => (
            <TaskListGroup key={group.label} title={group.label} count={group.items.length} darkMode={darkMode}>
              {group.items.map((sim) => {
                const { text: statusText, tone } = statusLabel(sim);
                const originName = countryName(sim.origin);
                const destName = countryName(sim.destination);
                return (
                  <TaskListItem
                    key={sim.id}
                    darkMode={darkMode}
                    title={sim.productDescription}
                    subtitle={`${originName} → ${destName} · Ref. ${sim.id.slice(0, 8)}…`}
                    checked={checked.has(sim.id)}
                    onCheckedChange={(next) => {
                      setChecked((prev) => {
                        const copy = new Set(prev);
                        if (next) copy.add(sim.id);
                        else copy.delete(sim.id);
                        return copy;
                      });
                    }}
                    onClick={() => onViewDetail(sim)}
                    tags={
                      <>
                        <TaskListTag tone={tone} darkMode={darkMode}>
                          {statusText}
                        </TaskListTag>
                        <TaskListTag tone="primary" darkMode={darkMode}>
                          HS {sim.hsCode}
                        </TaskListTag>
                      </>
                    }
                    meta={
                      <>
                        <TaskListMeta
                          icon={<Calendar className="h-3.5 w-3.5" />}
                          darkMode={darkMode}
                        >
                          {formatRelativeDate(sim.date)}
                        </TaskListMeta>
                        <TaskListMeta icon={<MapPin className="h-3.5 w-3.5" />} darkMode={darkMode}>
                          {sim.year}
                        </TaskListMeta>
                        <TaskListMeta darkMode={darkMode}>
                          {sim.totalTaxLocal.toLocaleString("en-US", { maximumFractionDigits: 0 })} tax
                        </TaskListMeta>
                      </>
                    }
                    trailing={
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          darkMode
                            ? "text-gray-500 group-hover:bg-primary-500/15 group-hover:text-primary-400"
                            : "text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    }
                  />
                );
              })}
            </TaskListGroup>
          ))
        )}

        {sorted.length > 0 && (
          <TaskListFooter darkMode={darkMode}>
            <label className="flex items-center gap-2">
              Show
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                  setPage(0);
                }}
                className={`${platform.input(darkMode)} !w-auto py-1 text-xs`}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              per page
            </label>
            <div className="flex items-center gap-2">
              <span>
                {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{" "}
                {sorted.length}
              </span>
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-40 ${platform.buttonGhost(darkMode)}`}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-40 ${platform.buttonGhost(darkMode)}`}
              >
                Next
              </button>
            </div>
          </TaskListFooter>
        )}
      </TaskListShell>
    </div>
  );
}

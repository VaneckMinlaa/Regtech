import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import type { Country } from "@/domain/reference/types";
import { platform } from "@/presentation/theme/platformStyles";

type SortKey = "product" | "route" | "year" | "totalTax" | "hsCode" | "status" | "date";
type SortDir = "asc" | "desc";

interface SimulationHistoryTableProps {
  items: SimulationResult[];
  countries: Country[];
  selectedId: string | null;
  loading?: boolean;
  darkMode?: boolean;
  onSelect: (sim: SimulationResult) => void;
  onRefresh: () => void;
}

const PAGE_SIZES = [10, 25, 50] as const;

function statusLabel(sim: SimulationResult): { text: string; tone: "ok" | "neutral" } {
  if (sim.sensitiveExclusion) return { text: "Excluded", tone: "neutral" };
  return sim.isEligiblePrefAfCFTA
    ? { text: "Preferential", tone: "ok" }
    : { text: "Standard", tone: "neutral" };
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

function SortButton({
  label,
  active,
  dir,
  onClick,
  darkMode,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  darkMode: boolean;
}) {
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${
        darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
      <Icon className="h-3.5 w-3.5 opacity-70" />
    </button>
  );
}

export function SimulationHistoryTable({
  items,
  countries,
  selectedId,
  loading = false,
  darkMode = true,
  onSelect,
  onRefresh,
}: SimulationHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const countryName = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((sim) => {
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
  }, [items, search, countries]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "product":
          cmp = a.productDescription.localeCompare(b.productDescription);
          break;
        case "route":
          cmp = `${a.origin}${a.destination}`.localeCompare(`${b.origin}${b.destination}`);
          break;
        case "year":
          cmp = a.year - b.year;
          break;
        case "totalTax":
          cmp = a.totalTaxLocal - b.totalTaxLocal;
          break;
        case "hsCode":
          cmp = a.hsCode.localeCompare(b.hsCode);
          break;
        case "status":
          cmp = Number(a.isEligiblePrefAfCFTA) - Number(b.isEligiblePrefAfCFTA);
          break;
        case "date":
        default:
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const allPageChecked =
    paginated.length > 0 && paginated.every((sim) => checked.has(sim.id));

  const toggleAllOnPage = () => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (allPageChecked) paginated.forEach((sim) => next.delete(sim.id));
      else paginated.forEach((sim) => next.add(sim.id));
      return next;
    });
  };

  const thClass = `px-4 py-3 text-left ${darkMode ? "border-gray-800" : "border-gray-100"}`;
  const tdClass = `px-4 py-4 align-middle ${darkMode ? "border-gray-800" : "border-gray-100"}`;

  const statusPill = (tone: "ok" | "neutral", text: string) =>
    tone === "ok"
      ? darkMode
        ? "bg-primary-500/15 text-primary-300"
        : "bg-primary-50 text-primary-700"
      : darkMode
        ? "bg-amber-500/15 text-amber-300"
        : "bg-amber-50 text-amber-700";

  return (
    <div className="space-y-4" id="simulation_history_table">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className={`flex items-center gap-2 text-sm ${platform.textSecondary(darkMode)}`}>
          Show
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
              setPage(0);
            }}
            className={`${platform.input(darkMode)} !w-auto py-1.5 text-sm`}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          entries
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
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
              placeholder="Search…"
              className={`${platform.input(darkMode)} pl-9 text-sm`}
            />
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
            Download
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
        </div>
      </div>

      <div className={`overflow-x-auto rounded-xl border ${platform.border(darkMode)}`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className={darkMode ? "bg-dark-secondary/50" : "bg-gray-50"}>
            <tr className={`border-b ${platform.borderSubtle(darkMode)}`}>
              <th className={`${thClass} w-10`}>
                <input
                  type="checkbox"
                  checked={allPageChecked}
                  onChange={toggleAllOnPage}
                  className="rounded border-gray-400 text-primary-600 focus:ring-primary-500"
                  aria-label="Select all on page"
                />
              </th>
              <th className={thClass}>
                <SortButton label="Product" active={sortKey === "product"} dir={sortDir} onClick={() => toggleSort("product")} darkMode={darkMode} />
              </th>
              <th className={thClass}>
                <SortButton label="Route" active={sortKey === "route"} dir={sortDir} onClick={() => toggleSort("route")} darkMode={darkMode} />
              </th>
              <th className={thClass}>
                <SortButton label="Year" active={sortKey === "year"} dir={sortDir} onClick={() => toggleSort("year")} darkMode={darkMode} />
              </th>
              <th className={thClass}>
                <SortButton label="Total tax" active={sortKey === "totalTax"} dir={sortDir} onClick={() => toggleSort("totalTax")} darkMode={darkMode} />
              </th>
              <th className={thClass}>
                <SortButton label="HS code" active={sortKey === "hsCode"} dir={sortDir} onClick={() => toggleSort("hsCode")} darkMode={darkMode} />
              </th>
              <th className={thClass}>
                <SortButton label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} darkMode={darkMode} />
              </th>
              <th className={`${thClass} w-16 text-right`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((sim) => {
              const isSelected = selectedId === sim.id;
              const { text: statusText, tone } = statusLabel(sim);
              const originName = countryName(sim.origin);
              const destName = countryName(sim.destination);
              return (
                <tr
                  key={sim.id}
                  className={`border-b last:border-b-0 transition-colors cursor-pointer ${
                    platform.borderSubtle(darkMode)
                  } ${
                    isSelected
                      ? darkMode
                        ? "bg-primary-500/10"
                        : "bg-primary-50/80"
                      : darkMode
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelect(sim)}
                >
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked.has(sim.id)}
                      onChange={() => {
                        setChecked((prev) => {
                          const next = new Set(prev);
                          if (next.has(sim.id)) next.delete(sim.id);
                          else next.add(sim.id);
                          return next;
                        });
                      }}
                      className="rounded border-gray-400 text-primary-600 focus:ring-primary-500"
                      aria-label={`Select ${sim.id}`}
                    />
                  </td>
                  <td className={tdClass}>
                    <p className={`font-semibold ${platform.textPrimary(darkMode)}`}>
                      {sim.productDescription}
                    </p>
                    <p className={`mt-0.5 truncate max-w-[220px] font-mono text-xs ${platform.textMuted(darkMode)}`}>
                      {sim.id}
                    </p>
                  </td>
                  <td className={`${tdClass} ${platform.textSecondary(darkMode)}`}>
                    {originName} → {destName}
                  </td>
                  <td className={`${tdClass} font-mono ${platform.textSecondary(darkMode)}`}>{sim.year}</td>
                  <td className={`${tdClass} font-mono font-semibold text-primary-500`}>
                    {sim.totalTaxLocal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </td>
                  <td className={`${tdClass} font-mono font-semibold text-primary-500`}>HS {sim.hsCode}</td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPill(tone, statusText)}`}
                    >
                      {statusText}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(sim);
                      }}
                      className={`rounded-lg p-2 transition-colors ${
                        darkMode ? "text-gray-400 hover:bg-white/10 hover:text-primary-400" : "text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                      }`}
                      aria-label="View declaration"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <p className={`px-4 py-10 text-center text-sm ${platform.textMuted(darkMode)}`}>
            No simulations match your search.
          </p>
        )}
      </div>

      {sorted.length > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-3 text-sm ${platform.textMuted(darkMode)}`}>
          <p>
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length} simulations
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${platform.buttonGhost(darkMode)}`}
            >
              Previous
            </button>
            <span className="font-mono text-xs">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${platform.buttonGhost(darkMode)}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

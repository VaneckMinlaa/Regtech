import React from "react";

interface UsageMeterCardProps {
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  darkMode?: boolean;
}

function formatLimit(limit: number | null): string {
  return limit === null ? "∞" : limit.toLocaleString("en-US");
}

export function UsageMeterCard({
  label,
  used,
  limit,
  remaining,
  darkMode = true,
}: UsageMeterCardProps) {
  const unlimited = limit === null;
  const pct =
    limit !== null && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : used > 0 ? 100 : 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode ? "bg-[#101828]/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
          {label}
        </p>
        {!unlimited && (
          <span className={`text-[10px] font-mono font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {pct}%
          </span>
        )}
      </div>

      {!unlimited && (
        <div className={`mt-3 h-2.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct >= 90 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-primary-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <p className={`text-[11px] mt-2.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        {used.toLocaleString("en-US")} used
        {!unlimited && (
          <>
            {" "}
            · {remaining?.toLocaleString("en-US") ?? "0"} remaining · {formatLimit(limit)} included / month
          </>
        )}
        {unlimited && " · unlimited"}
      </p>
    </div>
  );
}

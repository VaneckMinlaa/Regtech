import React from "react";

interface UsageMeterCardProps {
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  darkMode?: boolean;
}

function formatLimit(limit: number | null): string {
  return limit === null ? "∞" : limit.toLocaleString("fr-FR");
}

export function UsageMeterCard({
  label,
  used,
  limit,
  remaining,
  darkMode = true,
}: UsageMeterCardProps) {
  const pct =
    limit !== null && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : used > 0 ? 100 : 0;
  const unlimited = limit === null;

  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode ? "bg-[#101828]/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <p className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`text-2xl font-extrabold font-display mt-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {unlimited ? used.toLocaleString("fr-FR") : remaining?.toLocaleString("fr-FR") ?? "0"}
        {!unlimited && (
          <span className={`text-sm font-normal ml-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            remaining{remaining !== 1 ? "s" : ""}
          </span>
        )}
      </p>
      <p className={`text-[11px] mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        {used.toLocaleString("fr-FR")} used{used > 1 ? "" : ""}
        {!unlimited && ` · ${formatLimit(limit)} included / month`}
        {unlimited && " · unlimited"}
      </p>
      {!unlimited && (
        <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

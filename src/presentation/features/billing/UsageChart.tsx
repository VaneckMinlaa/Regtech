import React, { useMemo } from "react";
import type { UsageDayPoint } from "@/infrastructure/http/regtechApiTypes";
import { platform } from "@/presentation/theme/platformStyles";

interface UsageChartProps {
  yearMonth: string;
  points: UsageDayPoint[];
  darkMode?: boolean;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildCumulativeSeries(yearMonth: string, points: UsageDayPoint[]) {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const totalDays = daysInMonth(year, month);
  const today = new Date();
  const lastDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : totalDays;

  const byDate = new Map(points.map((p) => [p.date, p.simulations]));
  let cumulative = 0;
  const series: { label: string; value: number; daily: number }[] = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${yearStr}-${monthStr.padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const daily = byDate.get(date) ?? 0;
    cumulative += daily;
    series.push({
      label: String(day),
      value: cumulative,
      daily,
    });
  }
  return series;
}

export function UsageChart({ yearMonth, points, darkMode = true }: UsageChartProps) {
  const series = useMemo(() => buildCumulativeSeries(yearMonth, points), [yearMonth, points]);
  const maxValue = Math.max(1, ...series.map((s) => s.value));

  const width = 640;
  const height = 200;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const coords = series.map((point, idx) => {
    const x = paddingLeft + (idx / Math.max(series.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (point.value / maxValue) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`
    : "";

  const gridColor = darkMode ? "#334155" : "#e2e8f0";
  const labelColor = darkMode ? "#64748b" : "#94a3b8";

  return (
    <div
      className={`${platform.cardNested(darkMode)} p-5`}
      id="usage_chart"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className={`text-sm font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
            Your usage
          </h3>
          <p className={`text-[11px] mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Cumulative simulations — {yearMonth}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
            darkMode
              ? "border-primary-500/30 text-primary-400 bg-primary-950/30"
              : "border-primary-200 text-primary-700 bg-primary-50"
          }`}
        >
          This month
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Usage chart">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke={gridColor} strokeWidth="1" />
              <text x={4} y={y + 4} fill={labelColor} fontSize="9">
                {Math.round(maxValue * ratio)}
              </text>
            </g>
          );
        })}
        {areaPath && (
          <>
            <path d={areaPath} fill={darkMode ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.15)"} />
            <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" />
          </>
        )}
        {coords.map((p) =>
          p.daily > 0 ? (
            <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#818cf8" />
          ) : null,
        )}
        {coords
          .filter((_, i) => i % Math.ceil(series.length / 6) === 0 || i === series.length - 1)
          .map((p) => (
            <text key={`lbl-${p.label}`} x={p.x} y={height - 6} textAnchor="middle" fill={labelColor} fontSize="9">
              {p.label}
            </text>
          ))}
      </svg>
    </div>
  );
}

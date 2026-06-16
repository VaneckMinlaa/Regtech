/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import type { TariffYearProjection } from "@/domain/reference/types";

interface MetricsChartProps {
  baseTax: number;
  projection: TariffYearProjection[];
  isEligible?: boolean;
  darkMode?: boolean;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  baseTax,
  projection,
  isEligible = true,
  darkMode = true,
}) => {
  const points = projection.length > 0
    ? projection
    : [2025, 2026, 2027, 2028, 2029, 2030].map((year) => ({
        year,
        reductionPct: 0,
        appliedTariffRate: baseTax,
        isEligiblePrefAfCFTA: false,
      }));

  const maxScale = Math.max(baseTax, ...points.map((p) => p.appliedTariffRate), 0.05);
  const yMax = Math.ceil(maxScale * 100 / 5) * 5 / 100 || 0.4;

  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pts = points.map((point, idx) => {
    const rx = paddingLeft + (idx / Math.max(points.length - 1, 1)) * chartWidth;
    const rate = point.appliedTariffRate;
    const ry = paddingTop + chartHeight - (rate / yMax) * chartHeight;
    return { x: rx, y: ry, tax: rate * 100, year: point.year, eligible: point.isEligiblePrefAfCFTA };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${paddingTop + chartHeight} L ${pts[0].x} ${paddingTop + chartHeight} Z`;

  const gridColor = darkMode ? "#334155" : "#e2e8f0";
  const labelColor = darkMode ? "fill-gray-500" : "fill-gray-600";
  const tooltipFill = darkMode ? "fill-gray-900" : "fill-white";
  const tooltipStroke = darkMode ? "stroke-primary-500/50" : "stroke-primary-500";
  const tooltipText = darkMode ? "fill-primary-400" : "fill-primary-700";

  const yTicks = [0, 0.1, 0.2, 0.3, 0.4].filter((t) => t <= yMax + 0.01);
  if (yTicks.length === 0 || yTicks[yTicks.length - 1] < yMax) {
    yTicks.push(yMax);
  }

  return (
    <div className={`border rounded-lg p-4 w-full transition-colors duration-300 font-sans ${
      darkMode ? "bg-dark-primary/60 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
    }`} id="metrics_chart_container">
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-xs font-bold uppercase tracking-wider font-display ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          AfCFTA customs duty trend (2025 – 2030)
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          darkMode ? "bg-primary-500/20 text-primary-400 border-primary-500/30" : "bg-primary-100 text-primary-800 border-primary-200"
        }`}>
          Données API
        </span>
      </div>

      {!isEligible && (
        <p className={`text-[10px] mb-2 font-semibold ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
          Produit ou route non éligible — courbe préférentielle non applicable (taux classique affiché).
        </p>
      )}

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {yTicks.map((tick, i) => {
            const ty = paddingTop + chartHeight - (tick / yMax) * chartHeight;
            return (
              <g key={i} className="opacity-70">
                <line
                  x1={paddingLeft}
                  y1={ty}
                  x2={width - paddingRight}
                  y2={ty}
                  stroke={gridColor}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text x={10} y={ty + 4} className={`${labelColor} text-[9px] font-mono font-semibold`}>
                  {Math.round(tick * 100)}%
                </text>
              </g>
            );
          })}

          <motion.path
            d={areaPath}
            fill="url(#prefGrad)"
            opacity={0.15}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 0.5 }}
          />

          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight - (baseTax / yMax) * chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight - (baseTax / yMax) * chartHeight}
            stroke="#f43f5e"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.6}
          />

          <motion.path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {pts.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                className={`fill-primary-500 stroke-2 hover:r-6 transition-all ${
                  darkMode ? "stroke-gray-900" : "stroke-white shadow"
                } ${!p.eligible ? "opacity-50" : ""}`}
              />
              <text x={p.x} y={paddingTop + chartHeight + 16} className={`${labelColor} text-[10px] font-mono font-bold`} textAnchor="middle">
                {p.year}
              </text>
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <rect
                  x={p.x - 30}
                  y={p.y - 28}
                  width={60}
                  height={20}
                  rx={4}
                  className={`${tooltipFill} ${tooltipStroke} stroke`}
                />
                <text x={p.x} y={p.y - 15} className={`${tooltipText} text-[9px] font-mono font-bold`} textAnchor="middle">
                  {p.tax.toFixed(1)}%
                </text>
              </g>
            </g>
          ))}

          <defs>
            <linearGradient id="prefGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`flex items-center justify-center gap-6 mt-2 text-[10px] font-medium ${
        darkMode ? "text-gray-400" : "text-gray-500"
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-0.5 bg-rose-500 inline-block border-t border-dashed"></span>
          <span>Taux Douanier Classique ({Math.round(baseTax * 100)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-primary-500 inline-block"></span>
          <span>AfCFTA preferential rate (target 0% by 2030)</span>
        </div>
      </div>
    </div>
  );
};

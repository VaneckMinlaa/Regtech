import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { ZlecafDutyResponse } from "@/infrastructure/http/regtechApiTypes";

interface AfcftaDutyProjectionProps {
  originCountryIso: string;
  hsCode: string;
  initialDutyRate?: number;
  sensitive?: boolean;
  darkMode?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();

function formatReduction(p: ZlecafDutyResponse): string {
  if (p.excluded) return "Exclusion (full tariff)";
  const pct = Math.round(p.reductionFraction * 100);
  if (pct >= 100) return "Total exemption (-100%)";
  if (pct === 0) return "Full tariff (0% reduction)";
  return `Reduction of -${pct}%`;
}

/** Projection ZLECAf 2025–2030 via `GET /afcfta/duty/projection`. */
export function AfcftaDutyProjection({
  originCountryIso,
  hsCode,
  initialDutyRate = 0.2,
  sensitive = false,
  darkMode = true,
}: AfcftaDutyProjectionProps) {
  const [projections, setProjections] = useState<ZlecafDutyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!originCountryIso || !hsCode) {
      setProjections([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    void regtechApi
      .getZlecafProjection({ hsCode, originCountryIso, initialDutyRate, sensitive })
      .then((res) => {
        if (!cancelled) setProjections(res.projections);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Projection error");
          setProjections([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [originCountryIso, hsCode, initialDutyRate, sensitive]);

  if (!originCountryIso || !hsCode) {
    return (
      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
        Select an origin country and an HS code to load the API projection.
      </p>
    );
  }

  return (
    <div className="space-y-3" id="afcfta_duty_projection">
      <span className={`text-[11px] font-bold uppercase tracking-widest block font-mono ${
        darkMode ? "text-gray-500" : "text-gray-500"
      }`}>
        Progressive reductions (AfCFTA API)
      </span>

      {loading && (
        <p className="text-[10px] text-gray-500 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Calculating projection…
        </p>
      )}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {projections.map((p) => {
          const isActive = p.calculationYear === CURRENT_YEAR;
          return (
            <div
              key={p.calculationYear}
              className={`p-4 rounded-lg border min-h-[88px] flex flex-col justify-between ${
                isActive
                  ? darkMode
                    ? "bg-dark-secondary border-primary-500/35 text-gray-100 font-bold"
                    : "bg-primary-50/50 border-primary-300 text-gray-900 font-bold"
                  : darkMode
                    ? "bg-[#101828] border-gray-800"
                    : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
              }`}
            >
              <span className={`text-[10px] font-mono ${
                isActive
                  ? darkMode ? "text-primary-400" : "text-primary-600"
                  : darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {p.calculationYear}
                {isActive ? " (Active year)" : ""}
              </span>
              <strong className={`text-xs block py-0.5 ${darkMode && !isActive ? "text-white" : ""}`}>
                {formatReduction(p)}
              </strong>
              <span className={`text-[9px] font-mono block ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                Applied rate: {(p.appliedDutyRate * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

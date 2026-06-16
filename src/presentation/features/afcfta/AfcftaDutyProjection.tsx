import React, { useEffect, useState } from "react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type { ZlecafDutyResponse } from "@/infrastructure/http/regtechApiTypes";
import { HelpToggle } from "@/presentation/components/shared/HelpToggle";
import { platform } from "@/presentation/theme/platformStyles";

interface AfcftaDutyProjectionProps {
  originCountryIso: string;
  hsCode: string;
  initialDutyRate?: number;
  sensitive?: boolean;
  darkMode?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();

function formatReduction(p: ZlecafDutyResponse): string {
  if (p.excluded) return "Exclusion — full tariff applies";
  const pct = Math.round(p.reductionFraction * 100);
  if (pct >= 100) return "Total exemption (−100%)";
  if (pct === 0) return "Full tariff (0% reduction)";
  return `Reduction of −${pct}%`;
}

/** AfCFTA duty projection 2025–2030 via `GET /afcfta/duty/projection`. */
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

  const ready = Boolean(originCountryIso && hsCode);

  useEffect(() => {
    if (!ready) {
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
  }, [originCountryIso, hsCode, initialDutyRate, sensitive, ready]);

  return (
    <div id="afcfta_duty_projection">
      <HelpToggle
        label="What are progressive AfCFTA reductions?"
        darkMode={darkMode}
        loading={loading}
        disabled={!ready}
      >
        <p>
          Under the AfCFTA tariff schedule, eligible goods benefit from a phased reduction of customs duties
          between 2025 and 2030. Each calendar year applies a different concession rate for the same origin
          country and HS code — the active year is used in your simulations.
        </p>

        {!ready && (
          <p className={platform.textMuted(darkMode)}>
            Select an origin country and an HS code to load the projection from the API.
          </p>
        )}

        {error && <p className="text-rose-500">{error}</p>}

        {ready && projections.length > 0 && (
          <ul className="space-y-2">
            {projections.map((p) => {
              const isActive = p.calculationYear === CURRENT_YEAR;
              return (
                <li
                  key={p.calculationYear}
                  className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b py-2 last:border-b-0 ${platform.borderSubtle(darkMode)}`}
                >
                  <span className={`font-medium ${isActive ? "text-primary-500" : platform.textPrimary(darkMode)}`}>
                    {p.calculationYear}
                    {isActive ? " (active year)" : ""}
                  </span>
                  <span className={platform.textMuted(darkMode)}>
                    {formatReduction(p)} · Applied rate {(p.appliedDutyRate * 100).toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {ready && !loading && !error && projections.length === 0 && (
          <p className={platform.textMuted(darkMode)}>No projection data available for this corridor.</p>
        )}
      </HelpToggle>
    </div>
  );
}

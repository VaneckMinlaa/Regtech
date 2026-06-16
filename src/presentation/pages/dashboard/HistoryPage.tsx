import React, { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { platform } from "@/presentation/theme/platformStyles";

interface HistoryPageProps {
  darkMode?: boolean;
}

/** F-03 — Historique complet des simulations (`GET /history`). */
export function HistoryPage({ darkMode = true }: HistoryPageProps) {
  const { countries } = useReferenceData();
  const [items, setItems] = useState<SimulationResult[]>([]);
  const [selected, setSelected] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await regtechApi.getHistory();
      setItems(data);
      setSelected((prev) => {
        if (prev && data.some((d) => d.id === prev.id)) return prev;
        return data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load simulation history");
      setItems([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass = (active: boolean) => platform.historyItem(darkMode, active);

  return (
    <div className="animate-fadeIn space-y-8 font-sans" id="history_page">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${
            darkMode ? "border-gray-700 text-gray-300 hover:bg-dark-secondary" : "border-gray-200 text-gray-700"
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 rounded-lg border border-rose-500/30 px-3 py-2">{error}</p>
      )}

      {loading && items.length === 0 ? (
        <p className={`text-xs text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Loading history…
        </p>
      ) : items.length === 0 ? (
        <p className={`text-xs text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          No saved simulations. Run one in the Simulator tab.
        </p>
      ) : (
        <div className="space-y-8">
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {items.map((sim) => {
              const originName = countries.find((c) => c.code === sim.origin)?.name ?? sim.origin;
              const destName = countries.find((c) => c.code === sim.destination)?.name ?? sim.destination;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setSelected(sim)}
                  className={cardClass(selected?.id === sim.id)}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-[10px] text-gray-500 truncate">{sim.id}</span>
                    <span className="text-[9px] text-gray-500">{sim.year}</span>
                  </div>
                  <p className={`font-semibold mt-1 truncate ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                    {sim.productDescription}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">
                    {originName} → {destName}
                  </p>
                  <p className="text-[10px] text-primary-500 font-mono mt-1">
                    {sim.totalTaxLocal.toLocaleString("en-US")} · HS {sim.hsCode}
                  </p>
                </button>
              );
            })}
          </div>

          {selected && (
            <DeclarationSummary simulation={selected} darkMode={darkMode} />
          )}
        </div>
      )}
    </div>
  );
}

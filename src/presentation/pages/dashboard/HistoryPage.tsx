import React, { useCallback, useEffect, useState } from "react";
import { History, Loader2, RefreshCw } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { MetricsChart } from "@/presentation/features/export/MetricsChart";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";

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
      setError(err instanceof Error ? err.message : "Impossible de charger l'historique");
      setItems([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass = (active: boolean) =>
    `w-full text-left p-3 rounded-lg border text-xs transition-all ${
      active
        ? darkMode
          ? "border-primary-500/50 bg-primary-950/20 ring-1 ring-primary-500/30"
          : "border-primary-300 bg-primary-50 ring-1 ring-primary-200"
        : darkMode
          ? "bg-[#101828] border-gray-800 hover:border-gray-700"
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
    }`;

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="history_page">
      <div
        className={`rounded-xl border p-5 flex flex-wrap items-center justify-between gap-3 ${
          darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-primary-500" />
          <div>
            <h2 className={`text-lg font-bold font-display ${darkMode ? "text-white" : "text-gray-900"}`}>
              Historique des simulations
            </h2>
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Toutes vos simulations enregistrées — fiches ZLECAf et exports PDF.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${
            darkMode ? "border-gray-700 text-gray-300 hover:bg-dark-secondary" : "border-gray-200 text-gray-700"
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Actualiser
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 rounded-lg border border-rose-500/30 px-3 py-2">{error}</p>
      )}

      {loading && items.length === 0 ? (
        <p className={`text-xs text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Chargement de l&apos;historique…
        </p>
      ) : items.length === 0 ? (
        <p className={`text-xs text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Aucune simulation enregistrée. Lancez une simulation dans l&apos;onglet Simulateur.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2 max-h-[70vh] overflow-y-auto">
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
                    {sim.totalTaxLocal.toLocaleString("fr-FR")} · HS {sim.hsCode}
                  </p>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="lg:col-span-8 space-y-6">
              <MetricsChart
                baseTax={selected.baseTariffRate}
                projection={selected.tariffProjection ?? []}
                isEligible={selected.isEligiblePrefAfCFTA}
                darkMode={darkMode}
              />
              <DeclarationSummary simulation={selected} darkMode={darkMode} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { SimulationHistoryTable } from "@/presentation/features/export/SimulationHistoryTable";
import { SectionPanel } from "@/presentation/components/shared/SectionPanel";
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
  const detailRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (sim: SimulationResult) => {
    setSelected(sim);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className="animate-fadeIn space-y-8 font-sans" id="history_page">
      {error && <p className="text-sm text-rose-500">{error}</p>}

      {loading && items.length === 0 ? (
        <p className={`flex items-center justify-center gap-2 py-12 text-sm ${platform.textMuted(darkMode)}`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading history…
        </p>
      ) : items.length === 0 ? (
        <p className={`text-center py-12 text-sm ${platform.textMuted(darkMode)}`}>
          No saved simulations. Run one in the Simulator tab.
        </p>
      ) : (
        <>
          <SectionPanel darkMode={darkMode}>
            <SimulationHistoryTable
              items={items}
              countries={countries}
              selectedId={selected?.id ?? null}
              loading={loading}
              darkMode={darkMode}
              onSelect={handleSelect}
              onRefresh={() => void load()}
            />
          </SectionPanel>

          {selected && (
            <SectionPanel darkMode={darkMode}>
              <div ref={detailRef} className="scroll-mt-24">
                <DeclarationSummary simulation={selected} darkMode={darkMode} />
              </div>
            </SectionPanel>
          )}
        </>
      )}
    </div>
  );
}

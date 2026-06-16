import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SimulationResult } from "@/domain/reference/types";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { SimulationHistoryTable } from "@/presentation/features/export/SimulationHistoryTable";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";
import { PAGE_INTROS } from "@/presentation/layout/pageIntros";
import { readHistoryIdFromUrl, writeHistoryIdToUrl } from "@/presentation/layout/dashboardTabs";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { platform } from "@/presentation/theme/platformStyles";
import { HistoryDetailPage } from "./HistoryDetailPage";

interface HistoryPageProps {
  darkMode?: boolean;
}

/** F-03 — Simulation history list + per-item detail view (`GET /history`). */
export function HistoryPage({ darkMode = true }: HistoryPageProps) {
  const { countries } = useReferenceData();
  const [items, setItems] = useState<SimulationResult[]>([]);
  const [historyId, setHistoryId] = useState(() => readHistoryIdFromUrl());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await regtechApi.getHistory();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load simulation history");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const syncFromUrl = () => setHistoryId(readHistoryIdFromUrl());
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const openDetail = (sim: SimulationResult) => {
    writeHistoryIdToUrl(sim.id, "push");
    setHistoryId(sim.id);
  };

  const backToList = () => {
    writeHistoryIdToUrl(null, "push");
    setHistoryId(null);
  };

  const selected = historyId ? items.find((item) => item.id === historyId) ?? null : null;

  if (historyId) {
    if (loading && !selected) {
      return (
        <p className={`flex items-center justify-center gap-2 py-12 text-sm ${platform.textMuted(darkMode)}`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading simulation…
        </p>
      );
    }

    if (!loading && !selected) {
      return (
        <div className="animate-fadeIn space-y-4 font-sans" id="history_detail_missing">
          <PlatformPageIntro
            title="Simulation not found"
            description="This record may have been removed or is no longer available."
            darkMode={darkMode}
          />
          <button
            type="button"
            onClick={backToList}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${platform.buttonGhost(darkMode)}`}
          >
            Back to list
          </button>
        </div>
      );
    }

    if (selected) {
      return <HistoryDetailPage simulation={selected} darkMode={darkMode} onBack={backToList} />;
    }
  }

  return (
    <div className="animate-fadeIn space-y-6 font-sans" id="history_page">
      <PlatformPageIntro
        title={PAGE_INTROS.HIST.title}
        description={PAGE_INTROS.HIST.description}
        darkMode={darkMode}
      />

      {error && <p className="text-sm text-rose-500">{error}</p>}

      {loading && items.length === 0 ? (
        <p className={`flex items-center justify-center gap-2 py-12 text-sm ${platform.textMuted(darkMode)}`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading history…
        </p>
      ) : items.length === 0 ? (
        <p className={`py-12 text-center text-sm ${platform.textMuted(darkMode)}`}>
          No saved simulations. Run one in the Simulator tab.
        </p>
      ) : (
        <SimulationHistoryTable
          items={items}
          countries={countries}
          loading={loading}
          darkMode={darkMode}
          onViewDetail={openDetail}
          onRefresh={() => void load()}
        />
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  Anchor,
  Loader2,
  Package,
  Scale,
  Smartphone,
  Warehouse,
} from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type {
  CamcisRegimeResponse,
  LandedCostResponse,
  PhoneImportPackResponse,
  PortFeesResponse,
} from "@/infrastructure/http/regtechApiTypes";

type ToolTab = "port" | "camcis" | "phones" | "landed";

interface CameroonApiToolsProps {
  darkMode?: boolean;
}

/** Outils Cameroun branchés sur `/cameroon/*` (port, CAMCIS, téléphones, landed cost). */
export function CameroonApiTools({ darkMode = true }: CameroonApiToolsProps) {
  const [tab, setTab] = useState<ToolTab>("port");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [port, setPort] = useState("PAD");
  const [containerType, setContainerType] = useState("20ft");
  const [portResult, setPortResult] = useState<PortFeesResponse | null>(null);

  const [nature, setNature] = useState("import_definitif");
  const [valueLocal, setValueLocal] = useState(5_000_000);
  const [camcisResult, setCamcisResult] = useState<CamcisRegimeResponse | null>(null);

  const [phoneValue, setPhoneValue] = useState(150_000);
  const [phoneQty, setPhoneQty] = useState(10);
  const [phoneResult, setPhoneResult] = useState<PhoneImportPackResponse | null>(null);

  const [cifValue, setCifValue] = useState(10_000_000);
  const [hsCode, setHsCode] = useState("851712");
  const [origin, setOrigin] = useState("CHN");
  const [landedResult, setLandedResult] = useState<LandedCostResponse | null>(null);

  const cardClass = `rounded-xl border p-5 ${
    darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 shadow-sm"
  }`;
  const inputClass = `w-full rounded px-2 py-1.5 text-xs font-mono ${
    darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300"
  }`;
  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-[10px] font-bold ${
      active ? "bg-primary-500 text-white" : darkMode ? "text-gray-400" : "text-gray-600"
    }`;

  const run = async (fn: () => Promise<void>) => {
    setError("");
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur API");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
    { id: "port", label: "Port", icon: <Anchor className="w-3 h-3" /> },
    { id: "camcis", label: "CAMCIS", icon: <Warehouse className="w-3 h-3" /> },
    { id: "phones", label: "Téléphones", icon: <Smartphone className="w-3 h-3" /> },
    { id: "landed", label: "Landed cost", icon: <Scale className="w-3 h-3" /> },
  ];

  return (
    <div className={cardClass} id="cameroon_api_tools">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary-500" />
        <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Outils fiscalité & logistique CM
        </h3>
      </div>

      <div className={`flex flex-wrap gap-1 p-0.5 rounded-lg border mb-4 ${
        darkMode ? "border-gray-700 bg-[#101828]" : "border-gray-200 bg-gray-50"
      }`}>
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={tabClass(tab === t.id)}>
            <span className="inline-flex items-center gap-1">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}

      {tab === "port" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">PORT</label>
              <select value={port} onChange={(e) => setPort(e.target.value)} className={inputClass}>
                <option value="PAD">Douala (PAD)</option>
                <option value="KRIBI">Kribi</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">CONTENEUR</label>
              <select value={containerType} onChange={(e) => setContainerType(e.target.value)} className={inputClass}>
                <option value="20ft">20 pieds</option>
                <option value="40ft">40 pieds</option>
                <option value="lcl">LCL</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void run(async () => {
                setPortResult(await regtechApi.estimatePortFees({ port, containerType }));
              })
            }
            className="py-2 px-4 rounded-lg text-xs font-bold bg-primary-500 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Estimer frais portuaires"}
          </button>
          {portResult && (
            <div className={`text-[11px] space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {portResult.lines.map((l) => (
                <p key={l.code}>
                  {l.label}: {l.amountMin.toLocaleString("fr-FR")} – {l.amountMax.toLocaleString("fr-FR")} {portResult.currency}
                </p>
              ))}
              <p className="font-bold text-primary-400">
                Total {portResult.totalMin.toLocaleString("fr-FR")} – {portResult.totalMax.toLocaleString("fr-FR")} {portResult.currency}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "camcis" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">NATURE</label>
              <select value={nature} onChange={(e) => setNature(e.target.value)} className={inputClass}>
                <option value="import_definitif">Import définitif</option>
                <option value="transit">Transit</option>
                <option value="entrepot">Entrepôt</option>
                <option value="admission_temporaire">Admission temporaire</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">VALEUR (XAF)</label>
              <input type="number" value={valueLocal} onChange={(e) => setValueLocal(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void run(async () => {
                setCamcisResult(await regtechApi.suggestCamcisRegime({ nature, valueLocal }));
              })
            }
            className="py-2 px-4 rounded-lg text-xs font-bold bg-primary-500 text-white"
          >
            Suggérer régime CAMCIS
          </button>
          {camcisResult && (
            <div className={`text-[11px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <p className="font-bold">{camcisResult.regimeCode} — {camcisResult.regimeLabel}</p>
              <p className="mt-1">{camcisResult.explanation}</p>
              <ul className="list-disc pl-4 mt-2 text-gray-500">
                {camcisResult.documentsRequired.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "phones" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">CIF UNITAIRE</label>
              <input type="number" value={phoneValue} onChange={(e) => setPhoneValue(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">QUANTITÉ</label>
              <input type="number" value={phoneQty} onChange={(e) => setPhoneQty(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void run(async () => {
                setPhoneResult(await regtechApi.getPhoneImportPack({
                  unitValueCif: phoneValue,
                  quantity: phoneQty,
                  originCountryIso: "CHN",
                }));
              })
            }
            className="py-2 px-4 rounded-lg text-xs font-bold bg-primary-500 text-white"
          >
            Pack import téléphones 2026
          </button>
          {phoneResult && (
            <div className={`text-[11px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <p>{phoneResult.reformNote}</p>
              <ol className="list-decimal pl-4 mt-2 space-y-1">
                {phoneResult.checklist.map((s) => (
                  <li key={s.step}>
                    <strong>{s.title}</strong> — {s.description}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {tab === "landed" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">CIF</label>
              <input type="number" value={cifValue} onChange={(e) => setCifValue(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">CODE HS</label>
              <input value={hsCode} onChange={(e) => setHsCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">ORIGINE</label>
              <input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} className={inputClass} maxLength={3} />
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void run(async () => {
                setLandedResult(await regtechApi.computeLandedCost({
                  cifValue,
                  hsCode,
                  originCountryIso: origin,
                  port: "PAD",
                  containerType: "20ft",
                  quantity: 1,
                }));
              })
            }
            className="py-2 px-4 rounded-lg text-xs font-bold bg-primary-500 text-white"
          >
            Calculer landed cost
          </button>
          {landedResult && (
            <div className={`text-[11px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <p>Taxes douanières : {landedResult.customsTaxes.totalTaxes.toLocaleString("fr-FR")} XAF</p>
              <p>Port : {landedResult.portFees.totalMin.toLocaleString("fr-FR")} – {landedResult.portFees.totalMax.toLocaleString("fr-FR")} XAF</p>
              <p className="font-bold text-primary-400 mt-2">
                Total {landedResult.grandTotalMin.toLocaleString("fr-FR")} – {landedResult.grandTotalMax.toLocaleString("fr-FR")} {landedResult.currency}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

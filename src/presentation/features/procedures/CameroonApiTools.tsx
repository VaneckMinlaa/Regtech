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
import { platform } from "@/presentation/theme/platformStyles";

type ToolTab = "port" | "camcis" | "phones" | "landed";

interface CameroonApiToolsProps {
  darkMode?: boolean;
}

/** Cameroon tools wired on `/cameroon/*` (port fees, CAMCIS, phones, landed cost). */
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

  const inputClass = platform.input(darkMode);
  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-medium transition-colors ${
      active ? platform.navActive(darkMode) : platform.navInactive(darkMode)
    }`;

  const run = async (fn: () => Promise<void>) => {
    setError("");
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "API error");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
    { id: "port", label: "Port", icon: <Anchor className="w-3 h-3" /> },
    { id: "camcis", label: "CAMCIS", icon: <Warehouse className="w-3 h-3" /> },
    { id: "phones", label: "Phones", icon: <Smartphone className="w-3 h-3" /> },
    { id: "landed", label: "Landed cost", icon: <Scale className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-8 animate-fadeIn border-t pt-8" id="cameroon_api_tools">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary-500" />
        <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Cameroon tax & logistics tools
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
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">CONTAINER</label>
              <select value={containerType} onChange={(e) => setContainerType(e.target.value)} className={inputClass}>
                <option value="20ft">20 ft</option>
                <option value="40ft">40 ft</option>
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
            className={`${platform.buttonPrimary} px-4 py-2 text-xs`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Estimate port fees"}
          </button>
          {portResult && (
            <div className={`text-[11px] space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {portResult.lines.map((l) => (
                <p key={l.code}>
                  {l.label}: {l.amountMin.toLocaleString("en-US")} – {l.amountMax.toLocaleString("en-US")} {portResult.currency}
                </p>
              ))}
              <p className="font-bold text-primary-400">
                Total {portResult.totalMin.toLocaleString("en-US")} – {portResult.totalMax.toLocaleString("en-US")} {portResult.currency}
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
                <option value="import_definitif">Definitive import</option>
                <option value="transit">Transit</option>
                <option value="entrepot">Warehouse (entrepot)</option>
                <option value="admission_temporaire">Temporary admission</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">VALUE (XAF)</label>
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
            className={`${platform.buttonPrimary} px-4 py-2 text-xs`}
          >
            Suggest CAMCIS regime
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
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">UNIT CIF</label>
              <input type="number" value={phoneValue} onChange={(e) => setPhoneValue(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">QUANTITY</label>
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
            className={`${platform.buttonPrimary} px-4 py-2 text-xs`}
          >
            Phone import pack 2026
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
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">HS CODE</label>
              <input value={hsCode} onChange={(e) => setHsCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 block mb-0.5">ORIGIN</label>
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
            className={`${platform.buttonPrimary} px-4 py-2 text-xs`}
          >
            Calculer landed cost
          </button>
          {landedResult && (
            <div className={`text-[11px] ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <p>Customs duties: {landedResult.customsTaxes.totalTaxes.toLocaleString("en-US")} XAF</p>
              <p>Port: {landedResult.portFees.totalMin.toLocaleString("en-US")} – {landedResult.portFees.totalMax.toLocaleString("en-US")} XAF</p>
              <p className="font-bold text-primary-400 mt-2">
                Total {landedResult.grandTotalMin.toLocaleString("en-US")} – {landedResult.grandTotalMax.toLocaleString("en-US")} {landedResult.currency}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

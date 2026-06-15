import React, { useState } from "react";
import {
  BadgeCheck,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type {
  AfcftaValidateResponse,
  CertificateDraftResponse,
} from "@/infrastructure/http/regtechApiTypes";

interface AfcftaToolsPanelProps {
  origin: string;
  destination?: string;
  hsCode: string;
  declaredValue?: number;
  darkMode?: boolean;
}

/** Validation origine AfCFTA + brouillon certificat (API authentifiée). */
export function AfcftaToolsPanel({
  origin,
  destination = "CMR",
  hsCode,
  declaredValue = 1_000_000,
  darkMode = true,
}: AfcftaToolsPanelProps) {
  const [costMatiere, setCostMatiere] = useState(400_000);
  const [mainOeuvre, setMainOeuvre] = useState(200_000);
  const [fraisLocaux, setFraisLocaux] = useState(50_000);
  const [prixVente, setPrixVente] = useState(1_000_000);
  const [validateResult, setValidateResult] = useState<AfcftaValidateResponse | null>(null);
  const [certificate, setCertificate] = useState<CertificateDraftResponse | null>(null);
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [loadingCert, setLoadingCert] = useState(false);
  const [error, setError] = useState("");

  const inputClass = `w-full rounded px-2 py-1.5 text-xs font-mono ${
    darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900"
  }`;

  const handleValidate = async () => {
    if (!origin || !hsCode) return;
    setError("");
    setLoadingValidate(true);
    try {
      const result = await regtechApi.validateAfcftaOrigin({
        origin,
        destination,
        hsCode,
        costMatiereLocale: costMatiere,
        mainOeuvreLocale: mainOeuvre,
        fraisLocaux,
        prixVenteExport: prixVente,
        declaredValueLocal: declaredValue,
      });
      setValidateResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur validation");
    } finally {
      setLoadingValidate(false);
    }
  };

  const handleCertificate = async () => {
    if (!origin || !hsCode || !validateResult) return;
    setError("");
    setLoadingCert(true);
    try {
      const draft = await regtechApi.createCertificateDraft({
        exporterName: "Exportateur AfCFTA",
        exporterAddress: `${origin} — adresse à compléter`,
        importerName: "Importateur CMR",
        importerAddress: "Douala, Cameroun",
        origin,
        destination,
        hsCode,
        productDescription: `Produit HS ${hsCode}`,
        originPercentage: validateResult.originPercentage,
        quantity: 1,
      });
      setCertificate(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur certificat");
    } finally {
      setLoadingCert(false);
    }
  };

  return (
    <div
      className={`border rounded-lg p-5 space-y-4 ${
        darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
      }`}
      id="afcfta_tools_panel"
    >
      <div className={`flex items-center gap-2 border-b pb-3 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <ShieldCheck className="w-4 h-4 text-primary-500" />
        <h3 className={`text-xs uppercase font-bold font-mono ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          Validation origine & certificat
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-500 block mb-0.5">COÛT MATIÈRE</label>
          <input type="number" value={costMatiere} onChange={(e) => setCostMatiere(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 block mb-0.5">MAIN-D&apos;ŒUVRE</label>
          <input type="number" value={mainOeuvre} onChange={(e) => setMainOeuvre(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 block mb-0.5">FRAIS LOCAUX</label>
          <input type="number" value={fraisLocaux} onChange={(e) => setFraisLocaux(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 block mb-0.5">PRIX VENTE EXPORT</label>
          <input type="number" value={prixVente} onChange={(e) => setPrixVente(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      {error && <p className="text-[10px] text-rose-400">{error}</p>}

      <button
        type="button"
        disabled={!origin || !hsCode || loadingValidate}
        onClick={() => void handleValidate()}
        className="w-full py-2 rounded-lg text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center gap-2"
      >
        {loadingValidate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
        Valider éligibilité AfCFTA
      </button>

      {validateResult && (
        <div className={`rounded-lg border p-3 text-[11px] space-y-2 ${
          validateResult.eligible
            ? darkMode ? "border-primary-500/30 bg-primary-950/20" : "border-primary-200 bg-primary-50"
            : darkMode ? "border-rose-500/30 bg-rose-950/20" : "border-rose-200 bg-rose-50"
        }`}>
          <p className="font-bold">
            {validateResult.eligible ? "Éligible" : "Non éligible"} — origine{" "}
            {validateResult.originPercentage.toFixed(1)}% (seuil {validateResult.thresholdRequired}%)
          </p>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Catégorie {validateResult.productCategory} · Groupe {validateResult.countryGroup}
          </p>
          <p className="font-mono">
            Taux { (validateResult.appliedRate * 100).toFixed(1)}% · Économie estimée{" "}
            {validateResult.savingsLocalCurrency.toLocaleString("fr-FR")} XAF
          </p>
          <ul className={`list-disc pl-4 space-y-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {validateResult.recommendations.slice(0, 3).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <button
            type="button"
            disabled={loadingCert}
            onClick={() => void handleCertificate()}
            className="mt-2 w-full py-1.5 rounded text-[10px] font-bold border border-primary-500/50 text-primary-400 flex items-center justify-center gap-1"
          >
            {loadingCert ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            Générer brouillon certificat
          </button>
        </div>
      )}

      {certificate && (
        <div className={`rounded-lg border p-3 text-[10px] ${darkMode ? "border-gray-700 bg-[#101828]" : "border-gray-200 bg-gray-50"}`}>
          <p className="font-bold text-primary-400">{certificate.title}</p>
          <p className="font-mono mt-1">ID {certificate.draftId}</p>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{certificate.disclaimer}</p>
          <ul className="mt-2 list-disc pl-4 text-gray-500">
            {certificate.requiredDocuments.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm font-mono border ${
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
      setCertificate(null);
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
      className={`border rounded-xl p-6 space-y-6 ${
        darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
      }`}
      id="afcfta_tools_panel"
    >
      <div className={`flex items-center gap-3 border-b pb-4 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <ShieldCheck className="w-5 h-5 text-primary-500" />
        <div>
          <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Validation origine &amp; certificat
          </h3>
          <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Coûts de production pour le calcul de la valeur ajoutée locale
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: "cost_matiere", label: "Coût matière (XAF)", value: costMatiere, set: setCostMatiere },
          { id: "main_oeuvre", label: "Main-d'œuvre (XAF)", value: mainOeuvre, set: setMainOeuvre },
          { id: "frais_locaux", label: "Frais locaux (XAF)", value: fraisLocaux, set: setFraisLocaux },
          { id: "prix_vente", label: "Prix vente export (XAF)", value: prixVente, set: setPrixVente },
        ].map(({ id, label, value, set }) => (
          <div key={id}>
            <label htmlFor={id} className="text-[11px] font-bold text-gray-500 block mb-2">
              {label}
            </label>
            <input
              id={id}
              type="number"
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-rose-400 rounded-lg border border-rose-500/30 px-3 py-2">{error}</p>}

      <button
        type="button"
        disabled={!origin || !hsCode || loadingValidate}
        onClick={() => void handleValidate()}
        className="w-full py-3 rounded-lg text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center gap-2"
      >
        {loadingValidate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
        Valider éligibilité AfCFTA
      </button>

      {validateResult && (
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            validateResult.eligible
              ? darkMode
                ? "border-primary-500/30 bg-primary-950/20"
                : "border-primary-200 bg-primary-50"
              : darkMode
                ? "border-rose-500/30 bg-rose-950/20"
                : "border-rose-200 bg-rose-50"
          }`}
        >
          <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
            {validateResult.eligible ? "Éligible au traitement préférentiel" : "Non éligible"}
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            <div>
              <span className="text-gray-500 text-xs block">Origine calculée</span>
              <span className="font-mono font-bold">{validateResult.originPercentage.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Seuil requis</span>
              <span className="font-mono">{validateResult.thresholdRequired}%</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Catégorie / groupe</span>
              <span>{validateResult.productCategory} · {validateResult.countryGroup}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Économie estimée</span>
              <span className="font-mono text-primary-500">
                {validateResult.savingsLocalCurrency.toLocaleString("fr-FR")} XAF
              </span>
            </div>
          </div>
          {validateResult.recommendations.length > 0 && (
            <ul className={`list-disc pl-5 space-y-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {validateResult.recommendations.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={loadingCert}
            onClick={() => void handleCertificate()}
            className="w-full py-2.5 rounded-lg text-sm font-bold border-2 border-primary-500/50 text-primary-400 hover:bg-primary-500/10 flex items-center justify-center gap-2"
          >
            {loadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Générer brouillon certificat
          </button>
        </div>
      )}

      {certificate && (
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            darkMode ? "border-gray-700 bg-[#101828]" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="text-center border-b border-dashed pb-4">
            <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">AfCFTA / ZLECAf</p>
            <p className={`font-bold text-base mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {certificate.title}
            </p>
            <p className="font-mono text-xs text-gray-500 mt-2">Réf. {certificate.draftId}</p>
          </div>
          <p className={`text-sm italic leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {certificate.disclaimer}
          </p>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-2">Documents requis</p>
            <ul className={`space-y-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {certificate.requiredDocuments.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-primary-500">•</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

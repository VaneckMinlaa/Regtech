import React, { useState } from "react";
import { BadgeCheck, FileText, Loader2 } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import type {
  AfcftaValidateResponse,
  CertificateDraftResponse,
} from "@/infrastructure/http/regtechApiTypes";
import { platform } from "@/presentation/theme/platformStyles";

interface AfcftaToolsPanelProps {
  origin: string;
  destination?: string;
  hsCode: string;
  declaredValue?: number;
  darkMode?: boolean;
}

/** AfCFTA origin validation + certificate draft (authenticated API). */
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

  const inputClass = platform.input(darkMode);

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
      setError(err instanceof Error ? err.message : "Validation error");
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
        exporterName: "AfCFTA exporter",
        exporterAddress: `${origin} — address to complete`,
        importerName: "CMR importer",
        importerAddress: "Douala, Cameroon",
        origin,
        destination,
        hsCode,
        productDescription: `HS product ${hsCode}`,
        originPercentage: validateResult.originPercentage,
        quantity: 1,
      });
      setCertificate(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Certificate error");
    } finally {
      setLoadingCert(false);
    }
  };

  return (
    <div id="afcfta_tools_panel" className="space-y-6">
      <div>
        <h3 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>
          AfCFTA origin validation & certificate
        </h3>
        <p className={`text-xs mt-1 ${platform.textMuted(darkMode)}`}>
          Production inputs used to calculate local value addition
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { id: "cost_matiere", label: "Material cost (XAF)", value: costMatiere, set: setCostMatiere },
          { id: "main_oeuvre", label: "Labor cost (XAF)", value: mainOeuvre, set: setMainOeuvre },
          { id: "frais_locaux", label: "Local fees (XAF)", value: fraisLocaux, set: setFraisLocaux },
          { id: "prix_vente", label: "Export sale price (XAF)", value: prixVente, set: setPrixVente },
        ].map(({ id, label, value, set }) => (
          <div key={id}>
            <label htmlFor={id} className={platform.fieldLabel(darkMode)}>
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

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <button
        type="button"
        disabled={!origin || !hsCode || loadingValidate}
        onClick={() => void handleValidate()}
        className={`w-full ${platform.buttonGradient} py-3`}
      >
        {loadingValidate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
        Validate AfCFTA eligibility
      </button>

      {validateResult && (
        <div className="space-y-4 border-t pt-6">
          <p
            className={`text-sm font-semibold ${
              validateResult.eligible ? "text-primary-500" : "text-rose-500"
            }`}
          >
            {validateResult.eligible ? "Eligible for preferential treatment" : "Not eligible"}
          </p>
          <div className={`space-y-3 text-sm ${platform.textSecondary(darkMode)}`}>
            <p>
              Calculated origin:{" "}
              <span className="font-mono font-bold">{validateResult.originPercentage.toFixed(1)}%</span>
              {" · "}
              Required threshold: <span className="font-mono">{validateResult.thresholdRequired}%</span>
            </p>
            <p>
              Category / group: {validateResult.productCategory} · {validateResult.countryGroup}
            </p>
            <p>
              Estimated savings:{" "}
              <span className="font-mono text-primary-500">
                {validateResult.savingsLocalCurrency.toLocaleString("en-US")} XAF
              </span>
            </p>
          </div>
          {validateResult.recommendations.length > 0 && (
            <ul className={`list-disc pl-5 space-y-1 text-sm ${platform.textMuted(darkMode)}`}>
              {validateResult.recommendations.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={loadingCert}
            onClick={() => void handleCertificate()}
            className={`w-full ${platform.buttonSecondary(darkMode)} border-2 border-primary-500/30 py-2.5 text-primary-500 dark:text-primary-400`}
          >
            {loadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate certificate draft
          </button>
        </div>
      )}

      {certificate && (
        <div className="space-y-4 border-t pt-6">
          <div className="text-center border-b border-dashed pb-4">
            <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">AfCFTA</p>
            <p className={`font-bold text-base mt-1 ${platform.textPrimary(darkMode)}`}>
              {certificate.title}
            </p>
            <p className={`font-mono text-xs mt-2 ${platform.textMuted(darkMode)}`}>
              Ref. {certificate.draftId}
            </p>
          </div>
          <p className={`text-sm italic leading-relaxed ${platform.textMuted(darkMode)}`}>
            {certificate.disclaimer}
          </p>
          <div>
            <p className={`text-[11px] font-bold uppercase mb-2 ${platform.textMuted(darkMode)}`}>
              Required documents
            </p>
            <ul className={`space-y-2 text-sm ${platform.textSecondary(darkMode)}`}>
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

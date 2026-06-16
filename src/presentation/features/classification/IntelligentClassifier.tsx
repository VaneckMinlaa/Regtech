/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, AlertCircle, ThumbsUp, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { ApiError } from "@/infrastructure/http/apiClient";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import {
  SearchableSelect,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { platform } from "@/presentation/theme/platformStyles";

interface IntelligentClassifierProps {
  onSelectHSCode: (code: string, description: string) => void;
  darkMode?: boolean;
  onUpgrade?: () => void;
}

interface ClassificationResult {
  mode: string; // cloud or local
  hs_code: string;
  confidence: number;
  suggestions: string[];
  reasoning: string;
  category: string;
}

export const IntelligentClassifier: React.FC<IntelligentClassifierProps> = ({ 
  onSelectHSCode,
  darkMode = true,
  onUpgrade,
}) => {
  const { products, isLoading: refLoading } = useReferenceData();
  const { canUse, recordUsage } = useSubscription();
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [result, setResult] = useState<ClassificationResult | null>(null);

  // User correction states
  const [showCorrection, setShowCorrection] = useState<boolean>(false);
  const [correctedCode, setCorrectedCode] = useState<string>("18010000");
  const [correctionSaved, setCorrectionSaved] = useState<boolean>(false);

  const handleClassify = async () => {
    if (!description.trim()) return;
    if (!canUse("classifications")) {
      setErr("Classification quota reached. Upgrade to a higher plan.");
      onUpgrade?.();
      return;
    }
    setIsLoading(true);
    setErr("");
    setCorrectionSaved(false);
    setShowCorrection(false);

    try {
      const data = await regtechApi.classify({ description });
      setResult(data);
      setCorrectedCode(data.hs_code);
      recordUsage("classifications");
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        setErr("Quota reached — see the Offers tab.");
        onUpgrade?.();
      } else {
        setErr(
          error instanceof ApiError
            ? error.message
            : "Unable to reach the classification service.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCorrection = () => {
    if (!result) return;
    
    // Save user correction feedback loop in localStorage
    const savedCorrections = JSON.parse(localStorage.getItem("afcfta_user_corrections") || "[]");
    const newCorrection = {
      id: "CORR_" + Date.now(),
      date: new Date().toISOString(),
      originalDescription: description,
      predictedCode: result.hs_code,
      correctedCode: correctedCode,
    };
    
    savedCorrections.unshift(newCorrection);
    localStorage.setItem("afcfta_user_corrections", JSON.stringify(savedCorrections.slice(0, 10)));
    
    setCorrectionSaved(true);
    
    // Auto update predicted result so simulation inherits corrected value
    setResult({
      ...result,
      hs_code: correctedCode,
      confidence: 100,
      reasoning: ` [Corrected by the user] ${result.reasoning}`
    });
  };

  return (
    <div className="space-y-8 font-sans" id="ai_classification_panel">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Customs description of goods
            </label>
            <textarea
              id="txt_product_description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${platform.input(darkMode)} resize-y min-h-[100px]`}
              placeholder="Ex: import of 50 i7 core laptop computers with accessories for resale..."
            />
          </div>

          <button
            onClick={handleClassify}
            id="btn_run_classification"
            disabled={isLoading || !description.trim()}
            className={`w-full ${platform.buttonGradient} py-3`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI analysis in progress...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Classify the goods</span>
              </>
            )}
          </button>

          {err && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{err}</span>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-12" id="skeleton_loading_ai">
                <div className="relative font-bold">
                  <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-4 h-4 text-primary-500 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-pulse" />
                </div>
                <div className="text-center font-bold">
                  <p className={`text-xs font-semibold font-display ${darkMode ? "text-gray-300" : "text-primary-900"}`}>Querying the business intelligence model...</p>
                  <p className={`text-[10px] font-mono mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>Analysis in progress…</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block mb-0.5 ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}>
                      Identified HS code
                    </span>
                    <h3 className="text-xl font-black tracking-tight font-display flex items-center gap-2">
                      <span className="text-primary-600 dark:text-primary-400 font-mono">{result.hs_code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                        darkMode ? "bg-primary-500/15 border-primary-500/30 text-primary-300" : "bg-primary-100 border-primary-200 text-primary-800"
                      }`}>
                        {result.category}
                      </span>
                    </h3>
                  </div>

                  {/* Mode badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                    result.mode === "cloud" 
                      ? "bg-purple-500/10 text-purple-650 dark:text-purple-300 border-purple-500/20" 
                      : "bg-gray-200 text-gray-700 border-gray-300 dark:bg-dark-secondary dark:text-gray-400 dark:border-gray-700"
                  }`}>
                    {result.mode === "cloud" ? "Cloud classification" : "Local classification"}
                  </span>
                </div>

                {/* Score de confiance */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Confidence score:</span>
                    <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{result.confidence}%</span>
                  </div>
                  <div className={`w-full rounded-full h-1.5 overflow-hidden ${darkMode ? "bg-dark-primary" : "bg-gray-205"}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.confidence >= 80 
                          ? "bg-primary-500" 
                          : result.confidence >= 50 
                            ? "bg-amber-500" 
                            : "bg-rose-500"
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Reasoning comment */}
                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed font-sans ${
                  darkMode ? "bg-dark-primary border-gray-800 text-gray-300" : "bg-white border-gray-200 text-gray-700 shadow-sm"
                }`}>
                <strong className={`text-[11px] uppercase tracking-wider block mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>Customs reasoning</strong>
                  {result.reasoning}
                </div>

                {/* Alternative suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="text-xs">
                    <span className={`font-semibold block mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Alternative suggestions (AI-03):</span>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestions.map((code) => {
                        const product = products.find((p) => p.code === code);
                        return (
                          <button
                            key={code}
                            onClick={() => {
                              onSelectHSCode(code, product?.description || "");
                              setCorrectedCode(code);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1.5 border hover:border-gray-400 focus:outline-none ${
                              darkMode ? "bg-dark-primary border-gray-800 hover:bg-dark-secondary text-gray-300" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
                            }`}
                          >
                            <span>{code}</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Action to push to simulator */}
                <div className={`flex gap-2.5 pt-3 border-t ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}>
                  <button
                    onClick={() => {
                      const desc = products.find((p) => p.code === result.hs_code)?.description || description;
                      onSelectHSCode(result.hs_code, desc);
                    }}
                    id="btn_load_in_simulator"
                    className={`flex-1 ${platform.buttonPrimary} py-2 text-xs`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Load into simulator</span>
                  </button>

                  <button
                    onClick={() => setShowCorrection(!showCorrection)}
                    className={`px-3 py-2 rounded-lg text-xs leading-none transition-colors border ${
                      darkMode ? "bg-dark-primary hover:bg-dark-secondary border-gray-800 text-gray-400 hover:text-gray-200" : "bg-white hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Correct the code
                  </button>
                </div>

                {/* Correction interface block (Feedback loop IA-04) */}
                {showCorrection && (
                  <div className={`p-3.5 border rounded-lg text-xs space-y-3.5 mt-2 animate-fadeIn ${
                    darkMode ? "bg-dark-primary/60 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
                  }`}>
                    <strong className={darkMode ? "text-white" : "text-gray-905"}>Manually adjust the HS code of the goods</strong>
                    
                    <div className="flex gap-2">
                      <SearchableSelect
                        id="select_correction_code"
                        value={correctedCode}
                        onChange={setCorrectedCode}
                        darkMode={darkMode}
                        loading={refLoading}
                        className="flex-1"
                        options={productToOptions(products)}
                        placeholder="Type HS code or description…"
                        noDataPlaceholder="Products unavailable"
                      />
 
                      <button
                        onClick={handleSaveCorrection}
                        className="bg-primary-600 hover:bg-primary-600 text-white font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>

                    {correctionSaved && (
                      <div className="text-[11px] text-primary-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
                        <span>Correction saved locally in history!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className={`py-12 text-center text-sm ${platform.textMuted(darkMode)}`}>
                Enter a product description and run classification.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

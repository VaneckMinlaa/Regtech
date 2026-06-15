/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Compass,
  Scale,
  Sparkles,
  Table,
  Sun,
  Moon,
  History,
  TrendingUp,
  BookMarked,
  ShieldAlert,
  Menu,
  X,
  CreditCard,
  ClipboardList,
} from "lucide-react";

import { SimulateurTaxes } from "@/presentation/features/tariff-calculator/SimulateurTaxes";
import { MetricsChart } from "@/presentation/features/export/MetricsChart";
import { DeclarationSummary } from "@/presentation/features/export/DeclarationSummary";
import { IntelligentClassifier } from "@/presentation/features/classification/IntelligentClassifier";
import { BatchLoader } from "@/presentation/features/export/BatchLoader";
import { PricingPage } from "@/presentation/features/billing/PricingPage";
import { PlanBadge } from "@/presentation/features/billing/PlanBadge";
import { CameroonChecklist } from "@/presentation/features/procedures/CameroonChecklist";
import { ClerkAuthButton } from "@/presentation/components/auth/ClerkAuthButton";
import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import {
  SearchableSelect,
  countryToOptions,
  productToOptions,
} from "@/presentation/components/shared/SearchableSelect";
import { ApiStatusBanner } from "@/presentation/components/shared/ApiStatusBanner";
import type { SimulationResult } from "@/domain/reference/types";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { regtechApi } from "@/infrastructure/http/regtechApi";
import { useSubscription } from "@/presentation/providers/SubscriptionProvider";
import { platform } from "@/presentation/theme/platformStyles";
import { QuotaToast } from "@/presentation/features/billing/QuotaToast";

interface CompareRow {
  countryCode: string;
  countryName: string;
  currency: string;
  totalTaxLocal: number;
  isEligiblePrefAfCFTA: boolean;
}

export function RegTechShell() {
  const { countries, products, apiOnline, isLoading: refLoading } = useReferenceData();
  const { darkMode, toggleDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<string>("SIM");
  const [billingReturnStatus, setBillingReturnStatus] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [utcClock, setUtcClock] = useState<string>("");

  const [passedHSCode, setPassedHSCode] = useState<string>("");
  const [passedDesc, setPassedDesc] = useState<string>("");

  const [history, setHistory] = useState<SimulationResult[]>([]);
  const [currentSelectedSimulation, setCurrentSelectedSimulation] =
    useState<SimulationResult | null>(null);

  const [compProduct, setCompProduct] = useState<string>("");
  const [compOrigin, setCompOrigin] = useState<string>("");
  const [compVal, setCompVal] = useState<number>(0);
  const [dest1, setDest1] = useState<string>("");
  const [dest2, setDest2] = useState<string>("");
  const [dest3, setDest3] = useState<string>("");
  const [compTariffs, setCompTariffs] = useState<CompareRow[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  const { activatePlanDemo, quotaAlert, dismissQuotaAlert } = useSubscription();

  const goToPricing = useCallback(() => {
    setActiveTab("PRICING");
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    const tab = params.get("tab");
    const status = params.get("status");
    const depositId = params.get("depositId");

    if (billing === "return") {
      setActiveTab("PRICING");
      if (status === "success" || status === "pending") {
        setBillingReturnStatus(status);
      }
      if (status === "success" && depositId) {
        const stored = localStorage.getItem("regtech_pending_plan");
        if (stored) {
          activatePlanDemo(stored as "starter" | "pro" | "business");
          localStorage.removeItem("regtech_pending_plan");
        }
      }
      window.history.replaceState({}, "", window.location.pathname);
    } else if (tab) {
      setActiveTab(tab.toUpperCase());
    }
  }, [activatePlanDemo]);

  useEffect(() => {
    const tick = () => {
      setUtcClock(
        new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      );
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (countries.length === 0) return;
    setCompOrigin((prev) => prev || countries[0].code);
    setDest1((prev) => prev || countries[0].code);
    setDest2((prev) => prev || countries[1]?.code || countries[0].code);
    setDest3((prev) => prev || countries[2]?.code || countries[0].code);
  }, [countries]);

  useEffect(() => {
    if (products.length > 0 && !compProduct) {
      setCompProduct(products[0].code);
    }
  }, [products, compProduct]);

  const refreshHistory = useCallback(async () => {
    try {
      const items = await regtechApi.getHistory();
      setHistory(items.slice(0, 5));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (
      !compProduct ||
      !compOrigin ||
      compVal <= 0 ||
      !dest1 ||
      countries.length === 0
    ) {
      setCompTariffs([]);
      return;
    }

    let cancelled = false;
    const destinations = [dest1, dest2, dest3].filter(Boolean);

    async function runCompare() {
      setCompLoading(true);
      try {
        const results = await Promise.all(
          destinations.map((dest) =>
            regtechApi.simulate({
              origin: compOrigin,
              destination: dest,
              hsCode: compProduct,
              declaredValueLocal: compVal,
              quantity: 1,
              costMatiereLocale: Math.round(compVal * 0.4),
              mainOeuvreLocale: Math.round(compVal * 0.15),
              fraisLocaux: Math.round(compVal * 0.1),
              prixVenteExport: compVal,
              year: 2026,
            }),
          ),
        );
        if (cancelled) return;
        setCompTariffs(
          results.map((r) => {
            const c = countries.find((x) => x.code === r.destination);
            return {
              countryCode: r.destination,
              countryName: c?.name ?? r.destination,
              currency: c?.currency ?? "",
              totalTaxLocal: r.totalTaxLocal,
              isEligiblePrefAfCFTA: r.isEligiblePrefAfCFTA,
            };
          }),
        );
      } catch {
        if (!cancelled) setCompTariffs([]);
      } finally {
        if (!cancelled) setCompLoading(false);
      }
    }

    const timer = window.setTimeout(() => void runCompare(), 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    compProduct,
    compOrigin,
    compVal,
    dest1,
    dest2,
    dest3,
    countries,
  ]);

  const handleSimulationLogged = (result: SimulationResult) => {
    setCurrentSelectedSimulation(result);
    void refreshHistory();
  };

  return (
    <div className={`platform-page min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${platform.page(darkMode)}`} id="main_app_workspace">
          {/* Mobile sidebar black overlay backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className={`fixed inset-0 ${platform.overlay} backdrop-blur-sm z-40 md:hidden animate-fadeIn`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop persistent, Mobile toggleable drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 transform shrink-0
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${platform.sidebar(darkMode)}
      `} id="left_sidebar_panel">
        
        {/* Brand / Header inside sidebar */}
        <div className={`p-4 border-b flex items-center justify-between ${platform.borderSubtle(darkMode)}`}>
          <div className="flex items-center gap-2.5">
            <DynamicLogo size="sm" darkMode={darkMode} />
            <div>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded border ${
                    darkMode 
                      ? "text-gray-400 bg-dark-secondary border-gray-700" 
                      : "text-gray-600 bg-gray-100 border-gray-200"
                }`}>
                  RegTech
                </span>
              </div>
              <h1 className={`text-xs sm:text-xs font-bold tracking-tight font-display ${platform.textPrimary(darkMode)}`}>
                Assistant ZLECAf
              </h1>
            </div>
          </div>
          
          {/* Close button for mobile inside drawer */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`md:hidden p-1.5 rounded-lg transition-colors ${platform.buttonGhost(darkMode)}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <span className={`${platform.sectionLabel(darkMode)} block px-2 mb-2`}>
            Navigation
          </span>
          
          <button
            onClick={() => { setActiveTab("SIM"); setIsMobileSidebarOpen(false); }}
            id="tab_simulator"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "SIM" 
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Simulateur tarifaire</span>
          </button>

          <button
            onClick={() => { setActiveTab("IA"); setIsMobileSidebarOpen(false); }}
            id="tab_ai_classifier"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "IA" 
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Classification HS</span>
          </button>

          <button
            onClick={() => { setActiveTab("AFT"); setIsMobileSidebarOpen(false); }}
            id="tab_afcfta_rules"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "AFT" 
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Zone d'Échanges ZLECAf</span>
          </button>

          <button
            onClick={() => { setActiveTab("CSV"); setIsMobileSidebarOpen(false); }}
            id="tab_batch_csv"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "CSV" 
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <Table className="w-4 h-4 shrink-0" />
            <span>Traitement par lot</span>
          </button>

          <span className={`${platform.sectionLabel(darkMode)} block px-2 mb-2 mt-4`}>
            Monétisation
          </span>

          <button
            onClick={() => { setActiveTab("PRICING"); setIsMobileSidebarOpen(false); }}
            id="tab_pricing"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "PRICING"
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Abonnements</span>
          </button>

          <button
            onClick={() => { setActiveTab("CHECKLIST"); setIsMobileSidebarOpen(false); }}
            id="tab_checklist"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "CHECKLIST"
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Checklist Cameroun</span>
          </button>

        </nav>

        {/* Sidebar Footer with Clock, System State & Theme Toggle */}
        <div className={`p-4 border-t space-y-3 ${platform.border(darkMode)}`}>
          <div className="flex items-center justify-between">
            <span className={`${platform.sectionLabel(darkMode)}`}>Thème</span>
            <button
              onClick={toggleDarkMode}
              id="btn_toggle_theme"
              className={`p-1.5 rounded-lg border transition-colors ${platform.buttonGhost(darkMode)}`}
              title="Changer de thème"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className={`text-[10px] font-mono px-2 py-1 rounded border text-center ${platform.textMuted(darkMode)} ${platform.cardNested(darkMode)}`} id="clock_time_utc">
            {utcClock}
          </div>

          <div className={`flex font-mono text-[10px] items-center justify-center gap-1.5 px-2 py-1 rounded border ${
            apiOnline
              ? darkMode
                ? `${platform.success(darkMode)} ${platform.cardNested(darkMode)}`
                : "text-primary-700 bg-primary-50 border-primary-100"
              : darkMode
                ? "text-rose-400 bg-dark-secondary border-rose-500/20"
                : "text-rose-700 bg-rose-50 border-rose-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${apiOnline ? "bg-primary-500" : "bg-rose-500"}`} />
            <span>{apiOnline ? "API connectee" : "API indisponible"}</span>
          </div>
        </div>
      </aside>

      {/* Main Viewport Content Block */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Unified Top Header Bar - fixe sur mobile, sticky sur desktop */}
        <header
          className={`flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 transition-colors duration-300
            fixed top-0 left-0 right-0 z-40 backdrop-blur
            md:relative md:sticky md:top-0 md:left-auto md:right-auto
            ${platform.header(darkMode)}`}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger button - only on mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-1.5 rounded-lg ${platform.textMuted(darkMode)} hover:text-primary-500 focus:outline-none`}
              id="mobile_hamburger_menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <DynamicLogo size="sm" darkMode={darkMode} className="hidden sm:flex" />
              <span className={`font-bold text-sm sm:text-base tracking-tight font-display transition-colors ${platform.textPrimary(darkMode)}`}>
                Assistant Douanier ZLECAf
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PlanBadge onClick={goToPricing} darkMode={darkMode} />
            <ClerkAuthButton />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col pt-16 md:pt-0">
        <ApiStatusBanner darkMode={darkMode} />

        <main className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
          <div className={`border rounded-lg p-6 relative overflow-hidden transition-all ${platform.hero(darkMode)}`}>
            <h2 className={`text-xl font-bold tracking-tight font-display mb-1.5 ${platform.heroTitle(darkMode)}`}>
              Assistant douanier AfCFTA
            </h2>
            <p className={`text-xs leading-relaxed max-w-4xl ${platform.heroSubtitle(darkMode)}`}>
              Estimez droits et taxes, vérifiez l&apos;éligibilité AfCFTA, classifiez vos produits et comparez plusieurs destinations — en un seul espace de travail.
            </p>
          </div>

          {/* Active Canvas Frame */}
          <div id="active_workspace_canvas">
          {activeTab === "SIM" && (
            <div className="space-y-6 animate-fadeIn font-sans">
              <SimulateurTaxes
                onSimulationRun={handleSimulationLogged}
                initialHSCode={passedHSCode}
                initialProductDesc={passedDesc}
                darkMode={darkMode}
                onUpgrade={goToPricing}
              />
              
              {/* Show calculated receipt if active */}
              {currentSelectedSimulation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left chart */}
                  <div className="space-y-6">
                    <MetricsChart
                      baseTax={currentSelectedSimulation.baseTariffRate}
                      projection={currentSelectedSimulation.tariffProjection ?? []}
                      isEligible={currentSelectedSimulation.isEligiblePrefAfCFTA}
                      darkMode={darkMode}
                    />
                    
                    {/* Multi destination quick compare panel */}
                    <div className={`border rounded-lg p-5 ${
                      darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                        Comparaison multi-destinations
                      </span>
                      <h4 className={`text-xs font-bold mt-1 mb-3 font-display ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        Simuler le transport du produit "{currentSelectedSimulation.productDescription}" vers 3 pays
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs leading-5">
                        {compTariffs.map((c, i) => (
                          <div key={i} className={`p-2.5 border rounded ${
                            darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200"
                          }`}>
                            <span className={`font-bold block truncate ${
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }`}>{c.countryName}</span>
                            <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400 mt-1 font-mono">
                              Total taxes:
                              <div className={`text-[10px] font-bold ${
                                darkMode ? "text-gray-300" : "text-primary-700"
                              }`}>
                                {c.totalTaxLocal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {c.currency}
                              </div>
                              <span className="text-[9px] font-normal block mt-0.5">
                                {c.isEligiblePrefAfCFTA ? "Preferentiel AfCFTA" : "Tarif standard"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right voucher certificate */}
                  <DeclarationSummary simulation={currentSelectedSimulation} darkMode={darkMode} />
                </div>
              )}
            </div>
          )}

          {activeTab === "IA" && (
            <div className="space-y-6 animate-fadeIn">
              <IntelligentClassifier
                onSelectHSCode={(code, desc) => {
                  setPassedHSCode(code);
                  setPassedDesc(desc);
                  setActiveTab("SIM");
                }}
                darkMode={darkMode}
                onUpgrade={goToPricing}
              />
            </div>
          )}

          {activeTab === "AFT" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="afcfta_rules_panel font-sans">
              <div className={`border rounded-lg p-6 space-y-6 lg:col-span-8 ${
                darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
              }`}>
                <div>
                  <h3 className={`text-base font-bold font-display ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>Annuaire des Règles ZLECAf & Traitement Préférentiel (AFT)</h3>
                  <p className={`text-xs leading-normal mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Selon la charte de l'AfCFTA, de nombreuses marchandises originaires de l'Afrique bénéficient d'un traitement fiscal préférentiel. L'analyse repose sur le critère de valeur ajoutée locale minimum de 40 % (Manuel ZLECAf).
                  </p>
                </div>

                {/* Mathematical rules visualization */}
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    <BookMarked className="w-3.5 h-3.5 text-primary-500" />
                    <span>Niveau de valeur ajoutée locale</span>
                  </h4>
                  <p className={`text-xs mb-3 leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Les critères d'éligibilité sous l'accord préférentiel de la Zone de Libre-Échange Continentale Africaine s'appuient sur une valeur de transformation locale stricte :
                  </p>
                  <div className={`px-4 py-3 rounded-lg border text-center font-bold text-sm font-display ${
                    darkMode ? "bg-dark-primary border-gray-800 text-primary-400" : "bg-primary-50 border-primary-200 text-primary-800"
                  }`}>
                    Critère de conformité économique : R_origine &ge; 40%
                  </div>
                </div>

                {/* Progressive phase evolution illustration */}
                <div className="space-y-3">
                  <span className={`text-[11px] font-bold uppercase tracking-widest block font-mono ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Abattements progressifs selon les années
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className={`p-2.5 rounded border ${
                      darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>2025</span>
                      <strong className={`text-xs block py-0.5 ${darkMode ? "text-white" : "text-gray-800"}`}>Tarif Plein (0% abattement)</strong>
                    </div>
                    <div className={`p-2.5 rounded border font-bold ${
                      darkMode ? "bg-dark-secondary border-primary-500/35 text-gray-100" : "bg-primary-50/50 border-primary-300 text-gray-900"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-primary-400" : "text-primary-600"}`}>2026 (Année Active)</span>
                      <strong className="text-xs block py-0.5">Abattement de -75%</strong>
                    </div>
                    <div className={`p-2.5 rounded border ${
                      darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>2027</span>
                      <strong className={`text-xs block py-0.5 ${darkMode ? "text-white" : "text-gray-800"}`}>Abattement de -80%</strong>
                    </div>
                    <div className={`p-2.5 rounded border ${
                      darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>2028</span>
                      <strong className={`text-xs block py-0.5 ${darkMode ? "text-white" : "text-gray-800"}`}>Abattement de -85%</strong>
                    </div>
                    <div className={`p-2.5 rounded border ${
                      darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>2029</span>
                      <strong className={`text-xs block py-0.5 ${darkMode ? "text-white" : "text-gray-800"}`}>Abattement de -90%</strong>
                    </div>
                    <div className={`p-2.5 rounded border ${
                      darkMode ? "bg-[#101828] border-gray-800" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                    }`}>
                      <span className={`text-[10px] font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>2030</span>
                      <strong className={`text-xs block py-0.5 ${darkMode ? "text-primary-400" : "text-primary-700 font-bold"}`}>Exemption Totale (-100%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side comparisons quick calculation list (EXP-02 Compare block) */}
              <div className="lg:col-span-4 space-y-6 lg:col-start-9">
                {/* Exclusions black list */}
                <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                  darkMode ? "bg-rose-950/20 border-rose-500/20" : "bg-rose-50 border-rose-250 text-rose-900 shadow-sm"
                }`}>
                  <h4 className={`font-bold font-display flex items-center gap-1 text-sm ${
                    darkMode ? "text-rose-300" : "text-rose-800"
                  }`}>
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Biens sensibles - Liste noire active (AFT-04)</span>
                  </h4>
                  <p className={`leading-relaxed ${
                    darkMode ? "text-rose-400/95" : "text-rose-700/90"
                  }`}>
                    Certaines marchandises listées par les décrets d'échanges (biens complexes, automobiles, textiles précieux et services sensibles comme le code <strong>98010000</strong>) font l'objet d'une exclusion de droits d'abattement pour préserver les industries nationales en développement. Ce système applique automatiquement la taxe pleine pour ces articles.
                  </p>
                </div>

                <div className={`border rounded-lg p-5 space-y-4 ${
                  darkMode ? "bg-dark-primary border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm"
                }`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${
                    darkMode ? "border-gray-800" : "border-gray-100"
                  }`}>
                    <TrendingUp className="w-4 h-4 text-primary-500" />
                    <h3 className={`text-xs uppercase font-bold font-mono ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}>
                      Comparaison Multi-Destinations
                    </h3>
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold block mb-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>PAYS D&apos;ORIGINE</label>
                    <SearchableSelect
                      value={compOrigin}
                      onChange={setCompOrigin}
                      loading={refLoading}
                      darkMode={darkMode}
                      dense
                      options={countryToOptions(countries)}
                      placeholder="Tapez pour filtrer un pays…"
                      noDataPlaceholder="Pays indisponibles (demarrer l'API)"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold block mb-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>PRODUIT (CODE HS)</label>
                    <SearchableSelect
                      value={compProduct}
                      onChange={setCompProduct}
                      loading={refLoading}
                      darkMode={darkMode}
                      dense
                      options={productToOptions(products)}
                      placeholder="Tapez code HS ou description…"
                      noDataPlaceholder="Produits indisponibles (demarrer l'API)"
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold block mb-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>VALEUR DE BASE COMPARABLE (FCFA)</label>
                    <input
                      type="number"
                      value={compVal}
                      onChange={(e) => setCompVal(Number(e.target.value))}
                      className={`w-full rounded px-2.5 py-1.5 text-xs font-mono ${
                        darkMode ? "bg-dark-secondary border-gray-800 text-gray-100" : "bg-white border-gray-300 text-gray-900 focus:border-primary-500 focus:outline-none"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-0.5 font-bold">PAYS 1</label>
                      <SearchableSelect
                        value={dest1}
                        onChange={setDest1}
                        loading={refLoading}
                        darkMode={darkMode}
                        dense
                        options={countryToOptions(countries)}
                        placeholder="Pays 1…"
                        noDataPlaceholder="—"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-0.5 font-bold">PAYS 2</label>
                      <SearchableSelect
                        value={dest2}
                        onChange={setDest2}
                        loading={refLoading}
                        darkMode={darkMode}
                        dense
                        options={countryToOptions(countries)}
                        placeholder="Pays 2…"
                        noDataPlaceholder="—"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-0.5 font-bold">PAYS 3</label>
                      <SearchableSelect
                        value={dest3}
                        onChange={setDest3}
                        loading={refLoading}
                        darkMode={darkMode}
                        dense
                        options={countryToOptions(countries)}
                        placeholder="Pays 3…"
                        noDataPlaceholder="—"
                      />
                    </div>
                  </div>

                  {/* Comparisons rendering */}
                  <div className={`space-y-2 mt-4 pt-4 border-t ${
                    darkMode ? "border-gray-800" : "border-gray-100"
                  }`}>
                    {compLoading && (
                      <p className="text-[10px] text-gray-500 font-mono">Calcul en cours...</p>
                    )}
                    {compTariffs.map((c, i) => (
                      <div key={i} className={`p-3 rounded border ${
                        darkMode ? "bg-[#101828] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-800 shadow-sm"
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold text-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{c.countryName} ({c.countryCode})</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${
                            c.isEligiblePrefAfCFTA
                              ? darkMode ? "bg-primary-500/10 text-primary-300 border-primary-500/20" : "bg-primary-100 text-primary-800 border-primary-200"
                              : darkMode ? "bg-dark-secondary text-gray-400 border-gray-700" : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {c.isEligiblePrefAfCFTA ? "Preferentiel" : "Standard"}
                          </span>
                        </div>
                        <div className={`font-mono text-[11px] font-bold ${
                          darkMode ? "text-primary-400" : "text-primary-700"
                        }`}>
                          {c.totalTaxLocal.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {c.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CSV" && (
            <div className="space-y-6 animate-fadeIn font-sans">
              <BatchLoader darkMode={darkMode} onUpgrade={goToPricing} />
            </div>
          )}

          {activeTab === "PRICING" && (
            <PricingPage darkMode={darkMode} returnStatus={billingReturnStatus} />
          )}

          {activeTab === "CHECKLIST" && (
            <CameroonChecklist darkMode={darkMode} onUpgrade={goToPricing} />
          )}
        </div>

        {activeTab === "SIM" && history.length > 0 && (
          <div className={`border rounded-lg p-5 ${darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-200"}`} id="history_cache_panel">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider font-sans flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              <span>Historique des simulations</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3">
              {history.map((sim, idx) => (
                <button
                  key={sim.id}
                  onClick={() => setCurrentSelectedSimulation(sim)}
                  className={`bg-[#101828] border hover:border-gray-700 py-2.5 px-3 rounded-lg text-left text-xs transition-all relative overflow-hidden flex flex-col justify-between h-20 ${currentSelectedSimulation?.id === sim.id ? "border-primary-500/60 ring-1 ring-primary-500/30" : "border-gray-800"}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] text-gray-400 block font-mono truncate max-w-[80px]">{sim.id}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{sim.year}</span>
                  </div>
                  
                  <div className="mt-2 text-gray-300 truncate max-w-[150px] font-semibold">
                    {sim.productDescription}
                  </div>
                  
                  <div className="text-[10px] text-gray-400 font-mono">
                    Prov: {sim.origin} &rarr; Dest: {sim.destination}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className={`border-t py-3 shrink-0 leading-relaxed text-[10px] ${platform.footer(darkMode)}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center font-sans">
          &copy; 2026 RegTech — Assistant douanier AfCFTA. Tous droits réservés.
        </div>
      </footer>

      </div>
      </div> {/* viewport wrapper */}

      <QuotaToast
        alert={quotaAlert}
        darkMode={darkMode}
        onDismiss={dismissQuotaAlert}
        onUpgrade={goToPricing}
      />
    </div>
  );
}

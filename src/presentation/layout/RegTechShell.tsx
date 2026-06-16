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
  Menu,
  X,
  CreditCard,
  ClipboardList,
  Landmark,
} from "lucide-react";

import { PricingPage } from "@/presentation/features/billing/PricingPage";
import { PlanBadge } from "@/presentation/features/billing/PlanBadge";
import { CameroonChecklist } from "@/presentation/features/procedures/CameroonChecklist";
import {
  AfcftaPage,
  BatchPage,
  CameroonPage,
  ClassifierPage,
  HistoryPage,
  SimulatorPage,
} from "@/presentation/pages/dashboard";
import { ClerkAuthButton } from "@/presentation/components/auth/ClerkAuthButton";
import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import { ApiStatusBanner } from "@/presentation/components/shared/ApiStatusBanner";
import type { SimulationResult } from "@/domain/reference/types";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { useSubscription, PENDING_DEPOSIT_STORAGE_KEY } from "@/presentation/providers/SubscriptionProvider";
import { platform } from "@/presentation/theme/platformStyles";
import { QuotaToast } from "@/presentation/features/billing/QuotaToast";

interface RegTechShellProps {
  /** Onglet initial (ex. depuis landing). */
  initialTab?: string;
}

export function RegTechShell({ initialTab }: RegTechShellProps = {}) {
  const { countries, products, apiOnline, isLoading: refLoading } = useReferenceData();
  const { darkMode, toggleDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<string>(initialTab?.toUpperCase() ?? "SIM");
  const [billingReturnStatus, setBillingReturnStatus] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [utcClock, setUtcClock] = useState<string>("");

  const [passedHSCode, setPassedHSCode] = useState<string>("");
  const [passedDesc, setPassedDesc] = useState<string>("");

  const [currentSelectedSimulation, setCurrentSelectedSimulation] =
    useState<SimulationResult | null>(null);

  const { confirmPaymentReturn, quotaAlert, dismissQuotaAlert } = useSubscription();

  const goToPricing = useCallback(() => {
    setActiveTab("PRICING");
    setIsMobileSidebarOpen(false);
  }, []);

  const goToHistory = useCallback(() => {
    setActiveTab("HIST");
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    const tab = params.get("tab");
    const status = params.get("status");
    const depositId =
      params.get("depositId") ?? sessionStorage.getItem(PENDING_DEPOSIT_STORAGE_KEY);

    const handlePaymentReturn = (id: string) => {
      sessionStorage.setItem(PENDING_DEPOSIT_STORAGE_KEY, id);
      setBillingReturnStatus("pending");
      void confirmPaymentReturn(id).then((txStatus) => {
        if (txStatus === "COMPLETED") {
          setBillingReturnStatus("success");
        } else if (txStatus === "FAILED") {
          setBillingReturnStatus("failed");
        } else {
          setBillingReturnStatus("pending");
        }
        localStorage.removeItem("regtech_pending_plan");
      });
    };

    if (billing === "return" || depositId) {
      setActiveTab("PRICING");
      if (depositId) {
        handlePaymentReturn(depositId);
      } else if (status === "success" || status === "pending" || status === "failed") {
        setBillingReturnStatus(status);
      }
      window.history.replaceState({}, "", window.location.pathname);
    } else if (tab) {
      setActiveTab(tab.toUpperCase());
    }
  }, [confirmPaymentReturn]);

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

  const handleSimulationLogged = (result: SimulationResult) => {
    setCurrentSelectedSimulation(result);
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

          <button
            onClick={() => { setActiveTab("HIST"); setIsMobileSidebarOpen(false); }}
            id="tab_history"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "HIST"
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Historique</span>
          </button>

          <span className={`${platform.sectionLabel(darkMode)} block px-2 mb-2 mt-4`}>
            Cameroun
          </span>

          <button
            onClick={() => { setActiveTab("CMR"); setIsMobileSidebarOpen(false); }}
            id="tab_cameroon_fiscal"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "CMR"
                ? platform.navActive
                : platform.navInactive(darkMode)
            }`}
          >
            <Landmark className="w-4 h-4 shrink-0" />
            <span>Fiscalité CM</span>
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
            <span>Checklist import</span>
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
            <SimulatorPage
              darkMode={darkMode}
              initialHSCode={passedHSCode}
              initialProductDesc={passedDesc}
              selectedSimulation={currentSelectedSimulation}
              onSimulationRun={handleSimulationLogged}
              onUpgrade={goToPricing}
              onOpenHistory={goToHistory}
            />
          )}

          {activeTab === "IA" && (
            <ClassifierPage
              darkMode={darkMode}
              onSelectHSCode={(code, desc) => {
                setPassedHSCode(code);
                setPassedDesc(desc);
                setActiveTab("SIM");
              }}
              onUpgrade={goToPricing}
            />
          )}

          {activeTab === "AFT" && (
            <AfcftaPage
              countries={countries}
              products={products}
              refLoading={refLoading}
              darkMode={darkMode}
            />
          )}

          {activeTab === "CSV" && (
            <BatchPage darkMode={darkMode} onUpgrade={goToPricing} />
          )}

          {activeTab === "HIST" && (
            <HistoryPage darkMode={darkMode} />
          )}

          {activeTab === "CMR" && (
            <CameroonPage darkMode={darkMode} />
          )}

          {activeTab === "PRICING" && (
            <PricingPage darkMode={darkMode} returnStatus={billingReturnStatus} />
          )}

          {activeTab === "CHECKLIST" && (
            <CameroonChecklist darkMode={darkMode} onUpgrade={goToPricing} />
          )}
        </div>
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

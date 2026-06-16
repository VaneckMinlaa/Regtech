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
import {
  isDashboardTab,
  readDashboardTabFromUrl,
  writeDashboardTabToUrl,
  type DashboardTab,
} from "@/presentation/layout/dashboardTabs";
import { PAGE_INTROS } from "@/presentation/layout/pageIntros";
import { PlatformPageIntro } from "@/presentation/components/shared/PlatformPageIntro";

interface RegTechShellProps {
  initialTab?: string;
}

const NAV_MAIN: { tab: DashboardTab; id: string; icon: React.ElementType; label: string }[] = [
  { tab: "SIM", id: "tab_simulator", icon: Compass, label: "Tariff simulator" },
  { tab: "IA", id: "tab_ai_classifier", icon: Sparkles, label: "HS classification" },
  { tab: "AFT", id: "tab_afcfta_rules", icon: Scale, label: "AfCFTA rules" },
  { tab: "CSV", id: "tab_batch_csv", icon: Table, label: "Batch processing" },
  { tab: "HIST", id: "tab_history", icon: History, label: "History" },
];

const NAV_CAMEROON: { tab: DashboardTab; id: string; icon: React.ElementType; label: string }[] = [
  { tab: "CMR", id: "tab_cameroon_fiscal", icon: Landmark, label: "Cameroon taxation" },
  { tab: "CHECKLIST", id: "tab_checklist", icon: ClipboardList, label: "Import checklist" },
];

function resolveInitialTab(initialTab?: string): DashboardTab {
  if (initialTab && isDashboardTab(initialTab)) {
    return initialTab.toUpperCase() as DashboardTab;
  }
  return readDashboardTabFromUrl();
}

function NavButton({
  active,
  darkMode,
  id,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  darkMode: boolean;
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      id={id}
      className={`${platform.navItem} ${
        active ? platform.navActive(darkMode) : platform.navInactive(darkMode)
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

export function RegTechShell({ initialTab }: RegTechShellProps = {}) {
  const { countries, products, isLoading: refLoading } = useReferenceData();
  const { darkMode, toggleDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<DashboardTab>(() => resolveInitialTab(initialTab));
  const [billingReturnStatus, setBillingReturnStatus] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [passedHSCode, setPassedHSCode] = useState("");
  const [passedDesc, setPassedDesc] = useState("");
  const [currentSelectedSimulation, setCurrentSelectedSimulation] = useState<SimulationResult | null>(null);

  const { confirmPaymentReturn, quotaAlert, dismissQuotaAlert } = useSubscription();

  const navigateToTab = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    writeDashboardTabToUrl(tab);
  }, []);

  const goToPricing = useCallback(() => navigateToTab("PRICING"), [navigateToTab]);
  const goToHistory = useCallback(() => navigateToTab("HIST"), [navigateToTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    const status = params.get("status");
    const depositId =
      params.get("depositId") ?? sessionStorage.getItem(PENDING_DEPOSIT_STORAGE_KEY);

    const handlePaymentReturn = (id: string) => {
      sessionStorage.setItem(PENDING_DEPOSIT_STORAGE_KEY, id);
      setBillingReturnStatus("pending");
      void confirmPaymentReturn(id).then((txStatus) => {
        if (txStatus === "COMPLETED") setBillingReturnStatus("success");
        else if (txStatus === "FAILED") setBillingReturnStatus("failed");
        else setBillingReturnStatus("pending");
        localStorage.removeItem("regtech_pending_plan");
      });
    };

    if (billing === "return" || depositId) {
      navigateToTab("PRICING");
      if (depositId) handlePaymentReturn(depositId);
      else if (status === "success" || status === "pending" || status === "failed") {
        setBillingReturnStatus(status);
      }
    }
  }, [confirmPaymentReturn, navigateToTab]);

  return (
    <div
      className={`platform-page min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${platform.page(darkMode)}`}
      id="main_app_workspace"
    >
      {isMobileSidebarOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${platform.overlay} backdrop-blur-sm`}
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r transition-transform duration-300
          md:static md:h-screen md:translate-x-0 md:sticky md:top-0
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${platform.sidebar(darkMode)}
        `}
        id="left_sidebar_panel"
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${platform.borderSubtle(darkMode)}`}>
          <a href="#" className="flex items-center gap-2.5" onClick={(e) => e.preventDefault()}>
            <DynamicLogo size="sm" darkMode={darkMode} />
            <span className={`font-bold text-base tracking-tight ${platform.textPrimary(darkMode)}`}>RegTech</span>
            <span className="inline-block rounded-lg rounded-bl-none bg-primary-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
              AfCFTA
            </span>
          </a>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`md:hidden rounded-full p-1.5 transition-colors ${platform.buttonGhost(darkMode)}`}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_MAIN.map((item) => (
            <NavButton
              key={item.tab}
              active={activeTab === item.tab}
              darkMode={darkMode}
              id={item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => navigateToTab(item.tab)}
            />
          ))}

          <div className={`my-4 border-t ${platform.borderSubtle(darkMode)}`} />

          {NAV_CAMEROON.map((item) => (
            <NavButton
              key={item.tab}
              active={activeTab === item.tab}
              darkMode={darkMode}
              id={item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => navigateToTab(item.tab)}
            />
          ))}

          <div className={`my-4 border-t ${platform.borderSubtle(darkMode)}`} />

          <NavButton
            active={activeTab === "PRICING"}
            darkMode={darkMode}
            id="tab_pricing"
            icon={CreditCard}
            label="Pricing"
            onClick={() => navigateToTab("PRICING")}
          />
        </nav>
      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`fixed top-0 right-0 left-0 z-40 flex h-14 shrink-0 items-center justify-between border-b px-5 sm:px-7 md:relative md:sticky md:top-0 ${platform.header(darkMode)}`}
        >
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`rounded-full p-2 md:hidden ${platform.textMuted(darkMode)} hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40`}
            id="mobile_hamburger_menu"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden flex-1 md:block" aria-hidden />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`rounded-full border p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${platform.buttonGhost(darkMode)}`}
              aria-label="Change theme"
              id="btn_toggle_theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <PlanBadge onClick={goToPricing} darkMode={darkMode} />
            <ClerkAuthButton />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col pt-14 md:pt-0">
          <ApiStatusBanner darkMode={darkMode} />

          <main className={platform.main}>
            <div className={platform.content} id="active_workspace_canvas">
              <PlatformPageIntro
                title={PAGE_INTROS[activeTab].title}
                description={PAGE_INTROS[activeTab].description}
                darkMode={darkMode}
              />

              {activeTab === "SIM" && (
                <SimulatorPage
                  darkMode={darkMode}
                  initialHSCode={passedHSCode}
                  initialProductDesc={passedDesc}
                  selectedSimulation={currentSelectedSimulation}
                  onSimulationRun={setCurrentSelectedSimulation}
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
                    navigateToTab("SIM");
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

              {activeTab === "CSV" && <BatchPage darkMode={darkMode} onUpgrade={goToPricing} />}

              {activeTab === "HIST" && <HistoryPage darkMode={darkMode} />}

              {activeTab === "CMR" && <CameroonPage darkMode={darkMode} />}

              {activeTab === "PRICING" && (
                <PricingPage darkMode={darkMode} returnStatus={billingReturnStatus} />
              )}

              {activeTab === "CHECKLIST" && (
                <CameroonChecklist darkMode={darkMode} onUpgrade={goToPricing} />
              )}
            </div>
          </main>

          <footer className={`shrink-0 border-t py-4 text-center text-xs ${platform.footer(darkMode)}`}>
            <div className="px-5 sm:px-7">&copy; 2026 RegTech</div>
          </footer>
        </div>
      </div>

      <QuotaToast
        alert={quotaAlert}
        darkMode={darkMode}
        onDismiss={dismissQuotaAlert}
        onUpgrade={goToPricing}
      />
    </div>
  );
}

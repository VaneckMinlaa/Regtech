import { Calculator, ClipboardList, Scale, Sparkles, Table } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ThemeImage } from "../components/ThemeImage";
import { TOOL_TABS } from "../data/landingContent";

const TAB_ICONS: Record<string, ReactNode> = {
  simulator: <Calculator className="w-8 h-8" />,
  classifier: <Sparkles className="w-8 h-8" />,
  afcfta: <Scale className="w-8 h-8" />,
  batch: <Table className="w-8 h-8" />,
  checklist: <ClipboardList className="w-8 h-8" />,
};

interface ToolsTabSectionProps {
  onGetStarted: () => void;
}

export function ToolsTabSection({ onGetStarted }: ToolsTabSectionProps) {
  const [activeTab, setActiveTab] = useState("simulator");
  const currentTab = TOOL_TABS.find((tab) => tab.id === activeTab) ?? TOOL_TABS[0];

  return (
    <section id="tools" className="py-14 md:py-28 bg-white dark:bg-dark-primary">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 dark:text-white/90 text-3xl md:text-title-lg">
            All your customs tools in one place
          </h2>
          <p className="max-w-2xl mx-auto leading-6 text-gray-500 dark:text-gray-400">
            From the tariff simulator to the import checklist, RegTech covers your full AfCFTA trade workflow.
          </p>
        </div>

        <div className="max-w-[1008px] mx-auto">
          <div className="overflow-x-auto custom-scrollbar mx-auto max-w-fit relative">
            <div className="flex gap-2 min-w-max rounded-full bg-gray-100 dark:bg-white/5 p-1">
              {TOOL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center h-12 gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-full ${
                    activeTab === tab.id
                      ? "bg-white dark:text-white/90 dark:bg-white/10 text-gray-800 shadow-theme-xs"
                      : "text-gray-500 dark:text-gray-400 bg-transparent"
                  }`}
                >
                  {TAB_ICONS[tab.id]}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 tab-img-bg overflow-hidden rounded-4xl mt-8">
            <div className="p-3 tab-img-overlay">
              <ThemeImage
                lightSrc={currentTab.lightImage}
                darkSrc={currentTab.darkImage}
                alt={currentTab.label}
                className="w-full rounded-2xl"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">{currentTab.title}</h2>
            <p className="max-w-xl mx-auto mb-6 text-sm text-gray-500 dark:text-gray-400">{currentTab.description}</p>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-6 py-3 text-sm font-medium text-white transition-colors rounded-full bg-primary-500 hover:bg-primary-600"
            >
              Try for free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

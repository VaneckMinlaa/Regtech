import { Check } from "lucide-react";
import { useState } from "react";
import { formatLocalPrice, PRICING_PLANS } from "@/domain/billing/plans";

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const [yearly, setYearly] = useState(false);
  const displayPlans = PRICING_PLANS.filter((p) => p.id !== "enterprise");

  return (
    <section id="pricing" className="py-14 md:py-30 bg-gray-50 dark:bg-[#171f2e]">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl dark:text-white/90 md:text-title-lg">
            Des offres adaptées à chaque étape de croissance
          </h2>
          <p className="max-w-xl mx-auto leading-6 text-gray-500 dark:text-gray-400">
            Du plan gratuit à l&apos;offre Business, choisissez le niveau de quotas et de fonctionnalités
            qui correspond à votre volume d&apos;opérations.
          </p>
        </div>

        <div className="flex justify-center relative z-30 mt-12">
          <div className="relative flex p-1 bg-white dark:bg-[#1D2939] rounded-full shadow-theme-xs">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`relative flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
                !yearly ? "bg-gray-800 dark:bg-white/[0.05] text-white" : "text-gray-700 dark:text-gray-400"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`relative flex items-center gap-2 px-6 py-2 pr-2 text-sm font-medium transition-colors duration-200 rounded-full ${
                yearly ? "bg-gray-800 dark:bg-white/[0.05] text-white" : "text-gray-700 dark:text-gray-400"
              }`}
            >
              Annuel
              <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">−20 %</span>
            </button>
          </div>
        </div>

        <div className="mt-12 z-30 relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {displayPlans.map((plan) => {
            const priceXaf = yearly ? plan.priceXafYearly : plan.priceXafMonthly;
            const isFree = plan.id === "free";

            return (
              <div key={plan.id} className="relative">
                <div
                  className={`bg-white dark:bg-dark-primary rounded-[20px] shadow-one relative z-10 h-full ${
                    plan.highlighted ? "border-2 border-primary-500" : ""
                  }`}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400">{plan.name}</h2>
                      {plan.highlighted && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full dark:bg-primary-500/15 bg-primary-50 text-primary-500">
                          Populaire
                        </span>
                      )}
                    </div>
                    <p className="flex items-baseline mt-4">
                      <span className="text-4xl font-semibold text-gray-800 dark:text-white/90">
                        {isFree ? "Gratuit" : formatLocalPrice(priceXaf, "XAF")}
                      </span>
                      {!isFree && (
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          /{yearly ? "an" : "mois"}
                        </span>
                      )}
                    </p>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className={`block w-full px-8 py-3.5 mt-7 text-sm font-medium text-center rounded-full transition ${
                        plan.highlighted
                          ? "gradient-btn text-white"
                          : isFree
                            ? "dark:bg-dark-primary dark:text-white/90 text-gray-800 bg-white border border-gray-200 hover:bg-gray-50"
                            : "dark:hover:bg-primary-500 dark:bg-white/[0.03] hover:bg-gray-900 text-white bg-gray-700"
                      }`}
                    >
                      {isFree ? "Essayer gratuitement" : "Choisir ce plan"}
                    </button>
                  </div>
                  <div className="px-8 pb-7">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800 dark:text-white/90">
                          {plan.quotas.simulationsPerMonth ?? "∞"} simulations / mois
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800 dark:text-white/90">
                          {plan.quotas.classificationsPerMonth ?? "∞"} classifications IA
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800 dark:text-white/90">
                          {plan.quotas.pdfExport ? "Export PDF" : "—"}
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800 dark:text-white/90">
                          {plan.quotas.checklist ? "Checklist Cameroun" : "—"}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

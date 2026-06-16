import { CORE_FEATURES } from "../data/landingContent";
import { LandingReveal, LandingStagger, LandingStaggerItem } from "../components/LandingReveal";

export function CoreFeaturesSection() {
  return (
    <section id="features" className="py-30 bg-gray-50 dark:bg-[#171f2e]/50 px-5">
      <div className="max-w-[72rem] mx-auto">
        <LandingReveal className="mb-12 text-center">
          <h2 className="mb-3 font-bold text-gray-800 text-3xl dark:text-white/90 md:text-title-lg max-w-xl mx-auto">
            Key RegTech features
          </h2>
          <p className="max-w-xl mx-auto leading-6 text-gray-500 dark:text-gray-400">
            Everything your SME needs to anticipate customs costs, secure HS classifications, and accelerate intra-African trade flows.
          </p>
        </LandingReveal>

        <LandingStagger className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {CORE_FEATURES.map((feature) => (
            <LandingStaggerItem key={feature.title}>
              <div className="bg-white p-9 border border-gray-200 dark:bg-white/5 dark:border-white/3 rounded-xl shadow-[0px_30px_50px_-32px_rgba(107,110,148,0.04)] h-full">
                <div className="core-feature-icon mb-9">
                  <img src={feature.iconUrl} alt="" width={40} height={40} />
                </div>
                <h3 className="mb-4 text-gray-800 dark:text-white/90 font-bold text-xl md:text-2xl">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </div>
    </section>
  );
}

interface BenefitsGridSectionProps {
  onGetStarted: () => void;
}

export function BenefitsGridSection({ onGetStarted }: BenefitsGridSectionProps) {
  return (
    <section className="bg-gray-900 py-14 md:py-28">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="max-w-lg mx-auto mb-3 font-bold text-center text-white text-3xl md:text-title-lg">
            Practical benefits for your business.
          </h2>
          <p className="max-w-2xl mx-auto text-base leading-6 text-white/50">
            Reduce declaration errors, speed up client quotes, and manage your import-export costs across African markets.
          </p>
        </div>
        <div className="max-w-[1008px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <div className="relative flex flex-col justify-between bg-primary-500 rounded-[20px] p-9 md:p-13 min-h-[420px]">
                <div className="max-w-sm mb-32 relative z-10">
                  <h3 className="font-bold text-white text-2xl md:text-3xl mb-4">
                    Reliable simulations for your business decisions
                  </h3>
                  <p className="text-base text-white/70">
                    Anticipate duties, VAT, and AfCFTA eligibility before you ship.
                  </p>
                </div>
                <img src="/landing/benefits/bn-1.svg" className="-mb-8 md:-mb-13 w-full relative z-10" alt="" />
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="benefits-bg rounded-[20px] p-12 overflow-hidden min-h-[420px] flex flex-col justify-between">
                <div>
                  <img src="/landing/benefits/bn-2.svg" alt="" width={306} height={279} />
                </div>
                <div>
                  <h3 className="font-bold max-w-xs text-white text-2xl md:text-3xl mb-4">
                    Increase productivity on your customs files
                  </h3>
                  <p className="text-base max-w-sm text-white/70">
                    Centralized classification, comparison, and exports in a single assistant.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-12">
              <div className="lg:px-12 p-8 bg-[#2D0B70] lg:pb-0 lg:p-12 relative rounded-[20px] h-full lg:flex lg:flex-row justify-between bg-cover flex-col gap-5 overflow-hidden">
                <div className="max-w-sm relative z-10">
                  <h3 className="font-bold text-white text-2xl md:text-3xl mb-4">
                    Scale with plans tailored to SMEs
                  </h3>
                  <p className="text-base text-white/70 mb-8">
                    Flexible quotas, batch processing, and Mobile Money payments via PawaPay in supported countries.
                  </p>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="font-medium inline-block text-sm text-white rounded-full bg-primary-500 hover:bg-primary-600 transition py-3 px-6"
                  >
                    Get started now
                  </button>
                </div>
                <div>
                  <img src="/landing/benefits/bn-3.svg" className="hidden lg:block relative z-10" alt="" width={359} height={318} />
                </div>
                <img src="/landing/benefits/blur-shape.png" alt="" className="h-full w-full -z-0 absolute top-0 right-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface BenefitsGridSectionProps {
  onGetStarted: () => void;
}

export function BenefitsGridSection({ onGetStarted }: BenefitsGridSectionProps) {
  return (
    <section className="bg-gray-900 py-14 md:py-28">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="max-w-lg mx-auto mb-3 font-bold text-center text-white text-3xl md:text-title-lg">
            Les avantages concrets pour votre activité.
          </h2>
          <p className="max-w-2xl mx-auto text-base leading-6 text-white/50">
            Réduisez les erreurs de déclaration, accélérez vos devis clients et maîtrisez vos coûts
            d&apos;import-export sur les marchés africains.
          </p>
        </div>
        <div className="max-w-[1008px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <div className="relative flex flex-col justify-between bg-primary-500 rounded-[20px] p-9 md:p-13 min-h-[420px]">
                <div className="max-w-sm mb-32 relative z-10">
                  <h3 className="font-bold text-white text-2xl md:text-3xl mb-4">
                    Des simulations fiables pour vos décisions commerciales
                  </h3>
                  <p className="text-base text-white/70">
                    Anticipez droits, TVA et éligibilité AfCFTA avant d&apos;engager vos expéditions.
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
                    Gagnez en productivité sur vos dossiers douaniers
                  </h3>
                  <p className="text-base max-w-sm text-white/70">
                    Classification, comparaison et exports centralisés dans un seul assistant.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-12">
              <div className="lg:px-12 p-8 bg-[#2D0B70] lg:pb-0 lg:p-12 relative rounded-[20px] h-full lg:flex lg:flex-row justify-between bg-cover flex-col gap-5 overflow-hidden">
                <div className="max-w-sm relative z-10">
                  <h3 className="font-bold text-white text-2xl md:text-3xl mb-4">
                    Passez à l&apos;échelle avec des plans adaptés aux PME
                  </h3>
                  <p className="text-base text-white/70 mb-8">
                    Quotas flexibles, traitement par lot et paiement Mobile Money via PawaPay dans les pays couverts.
                  </p>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="font-medium inline-block text-sm text-white rounded-full bg-primary-500 hover:bg-primary-600 transition py-3 px-6"
                  >
                    Démarrer maintenant
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

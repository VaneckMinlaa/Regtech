interface LandingFooterProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function LandingFooter({ onSignIn, onGetStarted }: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gray-900">
      <span className="absolute top-0 -translate-x-1/2 left-1/2 pointer-events-none">
        <svg width="1260" height="457" viewBox="0 0 1260 457" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_footer)">
            <circle cx="630" cy="-173.299" r="230" fill="#3B2EFF" />
          </g>
          <defs>
            <filter id="filter0_f_footer" x="0" y="-803.299" width="1260" height="1260" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur" />
            </filter>
          </defs>
        </svg>
      </span>
      <div className="relative z-10 py-16 xl:py-24">
        <div className="wrapper">
          <div className="grid gap-y-8 gap-x-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xl font-bold text-white mb-4">RegTech</p>
              <p className="block text-sm text-gray-400 mb-9 max-w-sm">
                Assistant douanier AfCFTA pour les PME africaines : simulation tarifaire, classification HS,
                checklist import et abonnements Mobile Money.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="grid sm:grid-cols-2 gap-7">
                <div>
                  <span className="block mb-6 text-sm text-gray-400">Produit</span>
                  <nav className="flex flex-col space-y-3">
                    <a href="#features" className="text-sm text-gray-400 transition hover:text-white">Fonctionnalités</a>
                    <a href="#tools" className="text-sm text-gray-400 transition hover:text-white">Outils</a>
                    <a href="#pricing" className="text-sm text-gray-400 transition hover:text-white">Tarifs</a>
                    <a href="#faq" className="text-sm text-gray-400 transition hover:text-white">FAQ</a>
                  </nav>
                </div>
                <div>
                  <span className="block mb-6 text-sm text-gray-400">Compte</span>
                  <nav className="flex flex-col space-y-3">
                    <button type="button" onClick={onSignIn} className="text-left text-sm text-gray-400 transition hover:text-white">
                      Connexion
                    </button>
                    <button type="button" onClick={onGetStarted} className="text-left text-sm text-gray-400 transition hover:text-white">
                      Créer un compte
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <span className="block mb-6 text-sm text-gray-400">Prêt à démarrer ?</span>
              <p className="block mb-5 text-sm text-gray-400">
                Lancez votre première simulation tarifaire en moins de deux minutes.
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full px-6 py-3 text-sm font-medium text-white transition rounded-full bg-primary-500 hover:bg-primary-600"
              >
                Accéder à l&apos;application
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="wrapper py-5 text-center">
          <p className="text-sm text-gray-500">&copy; {year} RegTech — Assistant douanier AfCFTA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

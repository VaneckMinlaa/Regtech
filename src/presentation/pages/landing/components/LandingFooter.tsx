import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import { useTheme } from "@/presentation/providers/ThemeProvider";

interface LandingFooterProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function LandingFooter({ onSignIn, onGetStarted }: LandingFooterProps) {
  const { darkMode } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className={`relative overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-gray-50 border-t border-gray-200"
      }`}
    >
      {darkMode && (
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
      )}
      <div className="relative z-10 py-16 xl:py-24">
        <div className="wrapper">
          <div className="grid gap-y-8 gap-x-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2.5 mb-4">
                <DynamicLogo size="md" darkMode={darkMode} />
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>RegTech</p>
              </div>
              <p className={`block text-sm mb-9 max-w-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                AfCFTA customs assistant for African SMEs: tariff simulation, HS classification, import checklists,
                and Mobile Money subscriptions.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="grid sm:grid-cols-2 gap-7">
                <div>
                  <span className={`block mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Product</span>
                  <nav className="flex flex-col space-y-3">
                    <a href="#features" className={`text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>Features</a>
                    <a href="#tools" className={`text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>Tools</a>
                    <a href="#pricing" className={`text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>Pricing</a>
                    <a href="#faq" className={`text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>FAQ</a>
                  </nav>
                </div>
                <div>
                  <span className={`block mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Account</span>
                  <nav className="flex flex-col space-y-3">
                    <button type="button" onClick={onSignIn} className={`text-left text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>
                      Sign in
                    </button>
                    <button type="button" onClick={onGetStarted} className={`text-left text-sm transition ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}>
                      Create an account
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <span className={`block mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Ready to get started?</span>
              <p className={`block mb-5 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Run your first tariff simulation in under two minutes.
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full px-6 py-3 text-sm font-medium text-white transition rounded-full bg-primary-500 hover:bg-primary-600"
              >
                Access the application
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={darkMode ? "border-t border-gray-800" : "border-t border-gray-200"}>
        <div className="wrapper py-5 text-center">
          <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            &copy; {year} RegTech — AfCFTA customs assistant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import { AuthDivider } from "@/presentation/components/auth/AuthDivider";
import { AuthSocialButtons } from "@/presentation/components/auth/AuthSocialButtons";
import { CustomSignInForm } from "@/presentation/components/auth/CustomSignInForm";
import { CustomSignUpForm } from "@/presentation/components/auth/CustomSignUpForm";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import "@/presentation/pages/landing/landing.css";

interface ClerkSignInPageProps {
  onBack?: () => void;
  initialMode?: "sign-in" | "sign-up";
}

function AuthBackgroundGlow() {
  return (
    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 z-0 pointer-events-none opacity-70 dark:opacity-100">
      <svg width="930" height="760" viewBox="0 0 930 760" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.3" filter="url(#filter0_f_auth)">
          <circle cx="380.335" cy="380.335" r="179.665" fill="#FF58D5" />
        </g>
        <g opacity="0.7" filter="url(#filter1_f_auth)">
          <circle cx="549.665" cy="380.335" r="179.665" fill="#4E6EFF" />
        </g>
        <defs>
          <filter id="filter0_f_auth" x="0.669922" y="0.6698" width="759.33" height="759.33" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="100" />
          </filter>
          <filter id="filter1_f_auth" x="170" y="0.6698" width="759.33" height="759.33" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="100" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/** Connexion avec l'UI du template et la logique Clerk (hooks headless). */
export function ClerkSignInPage({ onBack, initialMode = "sign-in" }: ClerkSignInPageProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const isSignIn = mode === "sign-in";

  return (
    <div
      className={`landing-page min-h-screen flex flex-col ${
        darkMode ? "bg-[#101828]" : "bg-gradient-to-b from-[#F0F4FF] via-white to-white"
      }`}
    >
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-dark-primary/90 backdrop-blur">
        <div className="wrapper flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Accueil
              </button>
            ) : (
              <>
                <DynamicLogo size="md" darkMode={darkMode} />
                <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>RegTech</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary-500"
            aria-label="Changer de thème"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <section className="relative flex-1 flex items-center py-16 md:py-28 overflow-hidden">
        <div className="wrapper w-full relative z-10">
          <div className="max-w-[600px] mx-auto">
            <div className="contact-wrapper border p-8 sm:p-14 relative z-30 bg-white dark:bg-dark-primary dark:border-dark-primary border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-gray-800 dark:text-white/90 font-bold text-3xl mb-2">
                  {isSignIn ? "Connexion" : "Créer un compte"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isSignIn
                    ? "Connectez-vous pour accéder à votre espace RegTech."
                    : "Renseignez vos informations pour rejoindre RegTech."}
                </p>
              </div>

              <AuthSocialButtons mode={mode} onError={setOauthError} />
              {oauthError ? <p className="text-red-500 text-sm mt-3 text-center">{oauthError}</p> : null}

              <AuthDivider />

              {isSignIn ? <CustomSignInForm /> : <CustomSignUpForm />}

              <div className="mt-5">
                <p className="text-gray-700 dark:text-gray-400 text-sm text-center">
                  {isSignIn ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setOauthError(null);
                      setMode(isSignIn ? "sign-up" : "sign-in");
                    }}
                    className="text-sm font-semibold text-primary-500 hover:opacity-80"
                  >
                    {isSignIn ? "Créer un compte" : "Se connecter"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        <AuthBackgroundGlow />
      </section>
    </div>
  );
}

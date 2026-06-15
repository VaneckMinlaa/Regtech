import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { DynamicLogo } from "@/presentation/components/brand/DynamicLogo";
import { useTheme } from "@/presentation/providers/ThemeProvider";

interface LandingHeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { href: "#features", label: "Fonctionnalités" },
  { href: "#tools", label: "Outils" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader({ onSignIn, onGetStarted }: LandingHeaderProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-dark-primary border-b dark:border-gray-800 border-gray-100 sticky top-0 z-50 py-2 lg:py-4">
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <a href="#" className="flex items-center gap-2.5" onClick={(e) => e.preventDefault()}>
              <DynamicLogo size="md" darkMode={darkMode} />
              <span className={`font-bold text-lg tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                RegTech
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded-lg rounded-bl-none bg-primary-500/90 text-white text-xs font-medium">
                AfCFTA
              </span>
            </a>
          </div>

          <nav className="hidden lg:flex lg:items-center bg-[#F9FAFB] dark:bg-white/3 rounded-full p-1 max-h-fit">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-500 dark:text-gray-400 text-sm px-4 py-1.5 rounded-full hover:text-primary-500 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 justify-self-end">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary-500"
              aria-label="Changer de thème"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onSignIn}
              className="text-sm hidden lg:block font-medium text-gray-700 dark:text-gray-400 hover:text-primary-500"
            >
              Se connecter
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              className="lg:inline-flex items-center px-5 py-3 gradient-btn hidden text-sm text-white rounded-full h-11"
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t dark:border-gray-800 border-gray-100 px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-gray-600 dark:text-gray-300"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button type="button" onClick={onSignIn} className="block text-sm text-gray-600 dark:text-gray-300">
            Se connecter
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full px-5 py-3 gradient-btn text-sm text-white rounded-full"
          >
            Commencer gratuitement
          </button>
        </div>
      )}
    </header>
  );
}

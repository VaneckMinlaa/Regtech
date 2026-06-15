import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/presentation/providers/ThemeProvider";

export function ThemeToggleButton() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`fixed top-4 right-4 z-50 p-2 rounded-lg border transition-colors ${
        darkMode
          ? "bg-dark-primary border-gray-700 text-yellow-400 hover:bg-dark-secondary"
          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
      }`}
      title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label={darkMode ? "Mode clair" : "Mode sombre"}
    >
      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

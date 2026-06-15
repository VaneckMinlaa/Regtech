import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "regtech-theme";

function readStoredDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light") return false;
    if (stored === "dark") return true;
  } catch {
    /* ignore */
  }
  return true;
}

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState(readStoredDarkMode);

  const setDarkMode = useCallback((value: boolean) => {
    setDarkModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleDarkMode }),
    [darkMode, setDarkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme doit etre utilise dans ThemeProvider");
  }
  return ctx;
}

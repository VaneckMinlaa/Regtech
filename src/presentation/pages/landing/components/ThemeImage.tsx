import { useTheme } from "@/presentation/providers/ThemeProvider";

interface ThemeImageProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
}

/** Affiche une seule image selon le thème actif (évite les doublons light/dark). */
export function ThemeImage({ lightSrc, darkSrc, alt, className = "" }: ThemeImageProps) {
  const { darkMode } = useTheme();
  return <img src={darkMode ? darkSrc : lightSrc} alt={alt} className={className} />;
}

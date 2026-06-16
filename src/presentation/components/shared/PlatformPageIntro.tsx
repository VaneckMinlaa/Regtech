import { platform } from "@/presentation/theme/platformStyles";

interface PlatformPageIntroProps {
  title: string;
  description: string;
  darkMode?: boolean;
}

/** Page heading — plain text on the workspace background, no card wrapper. */
export function PlatformPageIntro({
  title,
  description,
  darkMode = true,
}: PlatformPageIntroProps) {
  return (
    <header className="mb-8 max-w-2xl">
      <h1 className={`text-2xl font-bold font-display tracking-tight ${platform.textPrimary(darkMode)}`}>
        {title}
      </h1>
      <p className={`mt-2 text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>{description}</p>
    </header>
  );
}

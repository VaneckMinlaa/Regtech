import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { platform } from "@/presentation/theme/platformStyles";

interface PageHelpConfig {
  label: string;
  children: ReactNode;
}

interface PlatformPageIntroProps {
  title: string;
  description: string;
  darkMode?: boolean;
  /** Help control aligned to the right of the page title (full-width expansion below). */
  help?: PageHelpConfig;
  trailing?: ReactNode;
}

/** Page heading — title row with optional help; description sits below. */
export function PlatformPageIntro({
  title,
  description,
  darkMode = true,
  help,
  trailing,
}: PlatformPageIntroProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="mb-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <h1 className={`text-2xl font-bold font-display tracking-tight ${platform.textPrimary(darkMode)}`}>
          {title}
        </h1>
        {help ? (
          <button
            type="button"
            onClick={() => setHelpOpen((prev) => !prev)}
            aria-expanded={helpOpen}
            className={`inline-flex shrink-0 items-center gap-1.5 text-sm transition-colors hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded ${platform.textMuted(darkMode)}`}
          >
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
            {help.label}
          </button>
        ) : (
          trailing
        )}
      </div>

      {help && helpOpen && (
        <div
          className={`space-y-3 rounded-2xl border p-4 text-sm leading-relaxed ${platform.border(darkMode)} ${platform.textSecondary(darkMode)}`}
          role="region"
        >
          {help.children}
        </div>
      )}

      <p className={`max-w-3xl text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>{description}</p>
    </header>
  );
}

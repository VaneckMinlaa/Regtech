import type { ReactNode } from "react";
import { platform } from "@/presentation/theme/platformStyles";

interface PlatformPageIntroProps {
  title: string;
  description: string;
  darkMode?: boolean;
  trailing?: ReactNode;
}

/** Page heading — outside the content card; optional trailing action on the same row. */
export function PlatformPageIntro({
  title,
  description,
  darkMode = true,
  trailing,
}: PlatformPageIntroProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <h1 className={`text-2xl font-bold font-display tracking-tight ${platform.textPrimary(darkMode)}`}>
          {title}
        </h1>
        <p className={`mt-2 text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>{description}</p>
      </div>
      {trailing ? <div className="shrink-0 text-sm">{trailing}</div> : null}
    </header>
  );
}

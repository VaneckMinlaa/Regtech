import type { ReactNode } from "react";
import { platform } from "@/presentation/theme/platformStyles";

interface PlatformPageContentProps {
  children: ReactNode;
  darkMode?: boolean;
  id?: string;
}

/** Main workspace card — title stays outside (see PlatformPageIntro). */
export function PlatformPageContent({
  children,
  darkMode = true,
  id,
}: PlatformPageContentProps) {
  return (
    <div
      id={id}
      className={`${platform.panel(darkMode)} ${platform.panelPadding} space-y-8`}
    >
      {children}
    </div>
  );
}

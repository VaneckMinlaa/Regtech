import type { ReactNode } from "react";
import { platform } from "@/presentation/theme/platformStyles";

interface SectionPanelProps {
  children: ReactNode;
  darkMode?: boolean;
  id?: string;
  className?: string;
}

/** Single content section card (title stays outside when used with PlatformPageIntro). */
export function SectionPanel({
  children,
  darkMode = true,
  id,
  className = "",
}: SectionPanelProps) {
  return (
    <section
      id={id}
      className={`${platform.panel(darkMode)} ${platform.panelPadding} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

/** @deprecated Use SectionPanel — kept for gradual migration */
export const PlatformPageContent = SectionPanel;

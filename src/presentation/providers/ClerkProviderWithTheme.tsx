import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/react";
import { enUS } from "@clerk/localizations";
import { clerkAppearance } from "@/presentation/providers/clerkAppearance";
import { useTheme } from "@/presentation/providers/ThemeProvider";

export function ClerkProviderWithTheme({
  publishableKey,
  children,
}: {
  publishableKey: string;
  children: ReactNode;
}) {
  const { darkMode } = useTheme();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      localization={enUS}
      appearance={clerkAppearance(darkMode)}
    >
      {children}
    </ClerkProvider>
  );
}

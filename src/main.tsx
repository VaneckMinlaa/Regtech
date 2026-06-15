import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReferenceDataProvider } from "@/presentation/providers/ReferenceDataProvider";
import { SubscriptionProvider } from "@/presentation/providers/SubscriptionProvider";
import { ClerkProviderWithTheme } from "@/presentation/providers/ClerkProviderWithTheme";
import { ClerkTokenBridge } from "@/presentation/providers/ClerkTokenBridge";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";
import { AuthGate } from "@/presentation/components/auth/AuthGate";
import { RegTechShell } from "@/presentation/layout/RegTechShell";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-8">
      <p className="text-sm text-center max-w-md">
        Variable <code className="font-mono text-emerald-400">VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
        manquante. Copiez <code className="font-mono">.env.example</code> vers{" "}
        <code className="font-mono">.env</code> et renseignez votre cle Clerk.
      </p>
    </div>
  );
}

function AppRoot() {
  return (
    <ReferenceDataProvider>
      <SubscriptionProvider>
        <ClerkTokenBridge>
          <AuthGate>
            <RegTechShell />
          </AuthGate>
        </ClerkTokenBridge>
      </SubscriptionProvider>
    </ReferenceDataProvider>
  );
}

const tree = (
  <StrictMode>
    <ThemeProvider>
      {!clerkPublishableKey ? (
        <MissingClerkConfig />
      ) : (
        <ClerkProviderWithTheme publishableKey={clerkPublishableKey}>
          <AppRoot />
        </ClerkProviderWithTheme>
      )}
    </ThemeProvider>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(tree);

import { useState, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { ClerkSignInPage } from "@/presentation/components/auth/ClerkSignInPage";
import { isSsoCallbackRoute, SsoCallbackHandler } from "@/presentation/components/auth/SsoCallbackHandler";
import { LandingPage } from "@/presentation/pages/landing/LandingPage";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { AuthLoadingSkeleton } from "@/presentation/components/shared/PlatformSkeletons";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { darkMode } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  if (!isLoaded) {
    return <AuthLoadingSkeleton darkMode={darkMode} />;
  }

  if (!isSignedIn && isSsoCallbackRoute()) {
    return (
      <SsoCallbackHandler
        onNavigateToSignIn={() => {
          setAuthMode("sign-in");
          setShowSignIn(true);
        }}
        onNavigateToSignUp={() => {
          setAuthMode("sign-up");
          setShowSignIn(true);
        }}
      />
    );
  }

  if (!isSignedIn) {
    if (showSignIn) {
      return <ClerkSignInPage initialMode={authMode} onBack={() => setShowSignIn(false)} />;
    }
    return (
      <LandingPage
        onSignIn={() => {
          setAuthMode("sign-in");
          setShowSignIn(true);
        }}
        onGetStarted={() => {
          setAuthMode("sign-up");
          setShowSignIn(true);
        }}
      />
    );
  }

  return <>{children}</>;
}

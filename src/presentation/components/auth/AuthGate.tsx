import { useState, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { ClerkSignInPage } from "@/presentation/components/auth/ClerkSignInPage";
import { isSsoCallbackRoute, SsoCallbackHandler } from "@/presentation/components/auth/SsoCallbackHandler";
import { LandingPage } from "@/presentation/pages/landing/LandingPage";
import { useTheme } from "@/presentation/providers/ThemeProvider";

function AuthLoadingScreen() {
  const { darkMode } = useTheme();
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-[#101828]" : "bg-gradient-to-b from-[#F0F4FF] to-white"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className={`text-xs font-sans ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Loading…</p>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  if (!isLoaded) {
    return <AuthLoadingScreen />;
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

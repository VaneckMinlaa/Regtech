import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { ClerkSignInPage } from "@/presentation/components/auth/ClerkSignInPage";
import { isSsoCallbackRoute, SsoCallbackHandler } from "@/presentation/components/auth/SsoCallbackHandler";
import { LandingIntroSplash } from "@/presentation/pages/landing/components/LandingIntroSplash";
import { LandingPage } from "@/presentation/pages/landing/LandingPage";
import { useTheme } from "@/presentation/providers/ThemeProvider";

const INTRO_MIN_MS = 1200;

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { darkMode } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const mountTime = useRef(Date.now());
  const [introPhase, setIntroPhase] = useState<"splash" | "done">("splash");
  const [splashExit, setSplashExit] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const elapsed = Date.now() - mountTime.current;
    const wait = Math.max(0, INTRO_MIN_MS - elapsed);
    const timer = window.setTimeout(() => setSplashExit(true), wait);
    return () => window.clearTimeout(timer);
  }, [isLoaded]);

  const showSplash = introPhase === "splash";

  if (!isLoaded || showSplash) {
    if (isLoaded && isSignedIn) {
      return (
        <>
          {children}
          {showSplash && (
            <LandingIntroSplash
              darkMode={darkMode}
              exit={splashExit}
              onFinished={() => setIntroPhase("done")}
            />
          )}
        </>
      );
    }

    return (
      <>
        {isLoaded && !isSignedIn && !showSignIn && (
          <LandingPage
            entranceReady={splashExit}
            onSignIn={() => {
              setAuthMode("sign-in");
              setShowSignIn(true);
            }}
            onGetStarted={() => {
              setAuthMode("sign-up");
              setShowSignIn(true);
            }}
          />
        )}
        {isLoaded && !isSignedIn && showSignIn && (
          <ClerkSignInPage initialMode={authMode} onBack={() => setShowSignIn(false)} />
        )}
        {showSplash && (
          <LandingIntroSplash
            darkMode={darkMode}
            exit={splashExit}
            onFinished={() => setIntroPhase("done")}
          />
        )}
      </>
    );
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

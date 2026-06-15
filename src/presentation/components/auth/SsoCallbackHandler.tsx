import { HandleSSOCallback } from "@clerk/react";
import { ssoRedirectUrl } from "@/presentation/components/auth/authFinalize";

interface SsoCallbackHandlerProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
}

export function SsoCallbackHandler({ onNavigateToSignIn, onNavigateToSignUp }: SsoCallbackHandlerProps) {
  const clearCallbackHash = () => {
    window.history.replaceState(null, "", ssoRedirectUrl());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101828]">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Finalisation de la connexion…</p>
        <HandleSSOCallback
          navigateToApp={() => clearCallbackHash()}
          navigateToSignIn={() => {
            clearCallbackHash();
            onNavigateToSignIn();
          }}
          navigateToSignUp={() => {
            clearCallbackHash();
            onNavigateToSignUp();
          }}
        />
      </div>
    </div>
  );
}

export function isSsoCallbackRoute() {
  return window.location.hash === "#sso-callback";
}

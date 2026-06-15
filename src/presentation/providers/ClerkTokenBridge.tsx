import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { registerAuthTokenGetter } from "@/infrastructure/http/authToken";
import { regtechApi } from "@/infrastructure/http/regtechApi";

/** Enregistre getToken() Clerk pour les requêtes authentifiées vers FastAPI. */
export function ClerkTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    registerAuthTokenGetter(async () => {
      if (!isSignedIn) return null;
      return getToken();
    });
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    void regtechApi.syncProfile().catch(() => {
      /* profil local optionnel au premier login */
    });
  }, [isSignedIn]);

  return <>{children}</>;
}

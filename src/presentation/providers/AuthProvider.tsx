import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/react";

export interface AuthState {
  isAuthenticated: boolean;
  isLoaded: boolean;
  email: string | null;
  signOut: () => void;
}

/** Pont vers Clerk — interface stable pour les features RegTech. */
export function useAuth(): AuthState {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  return {
    isAuthenticated: Boolean(isSignedIn),
    isLoaded,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    signOut: () => void signOut(),
  };
}

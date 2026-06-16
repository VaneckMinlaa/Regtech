import { useEffect, useRef, useState } from "react";
import { useAuth, useSignIn, useSignUp } from "@clerk/react";
import { GoogleIcon, LinkedInIcon } from "@/presentation/components/auth/AuthIcons";
import { authSocialButtonClass } from "@/presentation/components/auth/authStyles";
import { ssoCallbackUrl, ssoRedirectUrl } from "@/presentation/components/auth/authFinalize";

type OAuthStrategy = "oauth_google" | "oauth_linkedin_oidc";

const REDIRECT_SLOW_MS = 15_000;

interface AuthSocialButtonsProps {
  mode: "sign-in" | "sign-up";
  onError?: (message: string) => void;
}

const providers: { strategy: OAuthStrategy; label: string; icon: "google" | "linkedin" }[] = [
  { strategy: "oauth_google", label: "Google", icon: "google" },
  { strategy: "oauth_linkedin_oidc", label: "LinkedIn", icon: "linkedin" },
];

export function AuthSocialButtons({ mode, onError }: AuthSocialButtonsProps) {
  const { isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [loading, setLoading] = useState<OAuthStrategy | null>(null);
  const [slowRedirect, setSlowRedirect] = useState(false);
  const slowTimerRef = useRef<number | null>(null);

  const clerkReady =
    authLoaded && (mode === "sign-in" ? Boolean(signIn) : Boolean(signUp));

  useEffect(() => {
    return () => {
      if (slowTimerRef.current !== null) window.clearTimeout(slowTimerRef.current);
    };
  }, []);

  const clearSlowTimer = () => {
    if (slowTimerRef.current !== null) {
      window.clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    setSlowRedirect(false);
  };

  const startOAuth = async (strategy: OAuthStrategy) => {
    if (!clerkReady || loading !== null) return;

    setLoading(strategy);
    setSlowRedirect(false);
    slowTimerRef.current = window.setTimeout(() => setSlowRedirect(true), REDIRECT_SLOW_MS);

    try {
      const params = {
        strategy,
        redirectUrl: ssoRedirectUrl(),
        redirectCallbackUrl: ssoCallbackUrl(),
      };

      const { error } =
        mode === "sign-in" ? await signIn!.sso(params) : await signUp!.sso(params);

      if (error) {
        onError?.(error.message ?? "Unable to sign in with this provider.");
        setLoading(null);
        clearSlowTimer();
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Unable to start sign-in.");
      setLoading(null);
      clearSlowTimer();
    }
  };

  const prefix = mode === "sign-in" ? "Sign in with" : "Sign up with";
  const disabled = !clerkReady || loading !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-center gap-y-3.5 gap-x-5">
        {providers.map(({ strategy, label, icon }) => (
          <button
            key={strategy}
            type="button"
            disabled={disabled}
            onClick={() => void startOAuth(strategy)}
            className={authSocialButtonClass}
            aria-busy={loading === strategy}
          >
            {icon === "google" ? (
              <GoogleIcon className="shrink-0" />
            ) : (
              <LinkedInIcon className="size-5 shrink-0" />
            )}
            <span>
              {!clerkReady
                ? "Loading…"
                : loading === strategy
                  ? "Redirecting…"
                  : `${prefix} ${label}`}
            </span>
          </button>
        ))}
      </div>

      {slowRedirect && loading !== null && (
        <p className="text-center text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          Redirect is taking longer than usual. Try disabling ad blockers or privacy extensions for this
          site, or use another browser (Chrome often works best).
        </p>
      )}
    </div>
  );
}

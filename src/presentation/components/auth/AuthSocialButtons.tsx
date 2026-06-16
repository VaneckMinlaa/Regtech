import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/react";
import { GoogleIcon, LinkedInIcon } from "@/presentation/components/auth/AuthIcons";
import { authSocialButtonClass } from "@/presentation/components/auth/authStyles";
import { ssoCallbackUrl, ssoRedirectUrl } from "@/presentation/components/auth/authFinalize";

type OAuthStrategy = "oauth_google" | "oauth_linkedin_oidc";

interface AuthSocialButtonsProps {
  mode: "sign-in" | "sign-up";
  onError?: (message: string) => void;
}

const providers: { strategy: OAuthStrategy; label: string; icon: "google" | "linkedin" }[] = [
  { strategy: "oauth_google", label: "Google", icon: "google" },
  { strategy: "oauth_linkedin_oidc", label: "LinkedIn", icon: "linkedin" },
];

export function AuthSocialButtons({ mode, onError }: AuthSocialButtonsProps) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [loading, setLoading] = useState<OAuthStrategy | null>(null);

  const startOAuth = async (strategy: OAuthStrategy) => {
    setLoading(strategy);
    const params = {
      strategy,
      redirectUrl: ssoRedirectUrl(),
      redirectCallbackUrl: ssoCallbackUrl(),
    };

    const { error } =
      mode === "sign-in" ? await signIn.sso(params) : await signUp.sso(params);

    if (error) {
      onError?.(error.message ?? "Unable to sign in with this provider.");
      setLoading(null);
    }
  };

  const prefix = mode === "sign-in" ? "Sign in with" : "Sign up with";

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-y-3.5 gap-x-5">
      {providers.map(({ strategy, label, icon }) => (
        <button
          key={strategy}
          type="button"
          disabled={loading !== null}
          onClick={() => startOAuth(strategy)}
          className={authSocialButtonClass}
        >
          {icon === "google" ? <GoogleIcon className="shrink-0" /> : <LinkedInIcon className="size-5 shrink-0" />}
          <span>{loading === strategy ? "Redirecting…" : `${prefix} ${label}`}</span>
        </button>
      ))}
    </div>
  );
}

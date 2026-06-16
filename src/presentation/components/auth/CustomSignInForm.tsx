import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@clerk/react";
import { authInputClass, authLabelClass, authPrimaryButtonClass } from "@/presentation/components/auth/authStyles";
import { finalizeAuth } from "@/presentation/components/auth/authFinalize";

export function CustomSignInForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = fetchStatus === "fetching";

  const handleCredentials = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      setFormError(error.message ?? "Incorrect credentials.");
      return;
    }

    if (signIn.status === "complete") {
      await finalizeAuth(signIn);
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
      return;
    }

    if (signIn.status === "needs_second_factor") {
      setFormError("An additional verification is required on your account.");
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await finalizeAuth(signIn);
      return;
    }

    setFormError("Invalid or expired code.");
  };

  const handleResendCode = async () => {
    setFormError(null);
    await signIn.mfa.sendEmailCode();
  };

  const handleReset = () => {
    signIn.reset();
    setCode("");
    setFormError(null);
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <form onSubmit={handleVerifyCode} className="grid gap-5">
        <div>
          <h4 className="text-gray-800 dark:text-white/90 font-semibold text-lg mb-1">
            Verify your account
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A verification code has been sent to your email address.
          </p>
        </div>

        <div>
          <label htmlFor="sign-in-code" className={authLabelClass}>
            Verification code
          </label>
          <input
            id="sign-in-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={authInputClass}
            placeholder="123456"
            disabled={isLoading}
          />
          {errors?.fields?.code?.message ? (
            <p className="text-red-500 text-sm mt-1.5">{errors.fields.code.message}</p>
          ) : null}
        </div>

        {formError ? <p className="text-red-500 text-sm">{formError}</p> : null}

        <button type="submit" disabled={isLoading || !code} className={authPrimaryButtonClass}>
          {isLoading ? "Verifying…" : "Verify"}
        </button>

        <div className="flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-primary-500 font-medium hover:opacity-80"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="text-gray-500 dark:text-gray-400 hover:text-primary-500"
          >
            Start over
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentials} className="grid gap-5">
      <div>
        <label htmlFor="sign-in-email" className={authLabelClass}>
          Email address
        </label>
        <input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClass}
          placeholder="votre@email.com"
          disabled={isLoading}
          required
        />
        {errors?.fields?.identifier?.message ? (
          <p className="text-red-500 text-sm mt-1.5">{errors.fields.identifier.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="sign-in-password" className={authLabelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="sign-in-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClass}
            placeholder="Your password"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors?.fields?.password?.message ? (
          <p className="text-red-500 text-sm mt-1.5">{errors.fields.password.message}</p>
        ) : null}
      </div>

      {formError ? <p className="text-red-500 text-sm">{formError}</p> : null}

      <button type="submit" disabled={isLoading || !email || !password} className={authPrimaryButtonClass}>
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

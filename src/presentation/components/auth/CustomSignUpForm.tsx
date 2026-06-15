import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSignUp } from "@clerk/react";
import { authInputClass, authLabelClass, authPrimaryButtonClass } from "@/presentation/components/auth/authStyles";
import { finalizeAuth } from "@/presentation/components/auth/authFinalize";

export function CustomSignUpForm() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = fetchStatus === "fetching";

  const needsEmailVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields?.length === 0;

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) {
      setFormError(error.message ?? "Impossible de créer le compte.");
      return;
    }

    if (!error) {
      const sendResult = await signUp.verifications.sendEmailCode();
      if (sendResult.error) {
        setFormError(sendResult.error.message ?? "Impossible d'envoyer le code de vérification.");
      }
    }
  };

  const handleVerifyEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await finalizeAuth(signUp);
      return;
    }

    setFormError("Code invalide ou expiré.");
  };

  const handleResendCode = async () => {
    setFormError(null);
    await signUp.verifications.sendEmailCode();
  };

  if (needsEmailVerification) {
    return (
      <form onSubmit={handleVerifyEmail} className="grid gap-5">
        <div>
          <h4 className="text-gray-800 dark:text-white/90 font-semibold text-lg mb-1">
            Vérifiez votre e-mail
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saisissez le code envoyé à <span className="font-medium">{email}</span>.
          </p>
        </div>

        <div>
          <label htmlFor="sign-up-code" className={authLabelClass}>
            Code de vérification
          </label>
          <input
            id="sign-up-code"
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
          {isLoading ? "Vérification…" : "Valider mon compte"}
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-sm text-primary-500 font-medium hover:opacity-80 text-left"
        >
          Renvoyer le code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCreateAccount} className="grid gap-5">
      <div>
        <label htmlFor="sign-up-email" className={authLabelClass}>
          Adresse e-mail
        </label>
        <input
          id="sign-up-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClass}
          placeholder="votre@email.com"
          disabled={isLoading}
          required
        />
        {errors?.fields?.emailAddress?.message ? (
          <p className="text-red-500 text-sm mt-1.5">{errors.fields.emailAddress.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="sign-up-password" className={authLabelClass}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="sign-up-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClass}
            placeholder="Choisissez un mot de passe"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
        {isLoading ? "Création…" : "Créer mon compte"}
      </button>

      <div id="clerk-captcha" />
    </form>
  );
}

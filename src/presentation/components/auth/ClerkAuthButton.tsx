import { RegTechUserMenu } from "@/presentation/components/auth/RegTechUserMenu";

/** Menu utilisateur RegTech (remplace le UserButton Clerk). */
export function ClerkAuthButton({ onStartTour }: { onStartTour?: () => void } = {}) {
  return <RegTechUserMenu onStartTour={onStartTour} />;
}

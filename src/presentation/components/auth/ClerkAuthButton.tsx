import { RegTechUserMenu } from "@/presentation/components/auth/RegTechUserMenu";

/** Menu utilisateur RegTech (remplace le UserButton Clerk). */
export function ClerkAuthButton({
  onStartTour,
  onManagePlan,
}: {
  onStartTour?: () => void;
  onManagePlan?: () => void;
} = {}) {
  return <RegTechUserMenu onStartTour={onStartTour} onManagePlan={onManagePlan} />;
}

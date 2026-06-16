import { Lock } from "lucide-react";

interface AuthRequiredPanelProps {
  darkMode: boolean;
  feature: string;
}

export function AuthRequiredPanel({ darkMode, feature }: AuthRequiredPanelProps) {
  return (
    <div
      className={`border rounded-lg p-8 text-center ${
        darkMode
          ? "bg-dark-primary border-gray-800 text-gray-300"
          : "bg-white border-gray-200 text-gray-700 shadow-sm"
      }`}
    >
      <Lock className="w-8 h-8 mx-auto mb-3 text-gray-500" />
      <p className="text-sm font-semibold mb-1">Authentication required</p>
      <p className="text-xs text-gray-500">
        Sign in with Clerk to use {feature}.
      </p>
    </div>
  );
}

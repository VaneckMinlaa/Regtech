import { AlertCircle } from "lucide-react";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";
import { ApiBannerSkeleton } from "@/presentation/components/shared/PlatformSkeletons";

interface ApiStatusBannerProps {
  darkMode: boolean;
}

export function ApiStatusBanner({ darkMode }: ApiStatusBannerProps) {
  const { isLoading, productsLoading, error, reload } = useReferenceData();

  if (isLoading || productsLoading) {
    return <ApiBannerSkeleton darkMode={darkMode} />;
  }

  if (!error) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 text-xs border-b ${
        darkMode
          ? "bg-rose-950/30 border-rose-500/20 text-rose-300"
          : "bg-rose-50 border-rose-200 text-rose-800"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
      <button
        type="button"
        onClick={reload}
        className={`shrink-0 px-2 py-1 rounded font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
          darkMode
            ? "border-rose-500/30 hover:bg-rose-500/10"
            : "border-rose-300 hover:bg-rose-100"
        }`}
      >
        Try again
      </button>
    </div>
  );
}

import { AlertCircle, RefreshCw } from "lucide-react";
import { useReferenceData } from "@/presentation/providers/ReferenceDataProvider";

interface ApiStatusBannerProps {
  darkMode: boolean;
}

export function ApiStatusBanner({ darkMode }: ApiStatusBannerProps) {
  const { isLoading, productsLoading, error, reload } = useReferenceData();

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-5 py-2 text-xs border-b ${
          darkMode
            ? "bg-dark-primary/80 border-gray-800 text-gray-400"
            : "bg-white/90 border-gray-100 text-gray-600"
        }`}
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Loading countries from the API...
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-5 py-2 text-xs border-b ${
          darkMode
            ? "bg-dark-primary/80 border-gray-800 text-gray-400"
            : "bg-white/90 border-gray-100 text-gray-600"
        }`}
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Loading HS product catalog...
      </div>
    );
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

import { Skeleton } from "@/presentation/components/shared/Skeleton";
import { platform } from "@/presentation/theme/platformStyles";

interface SubscriptionPageSkeletonProps {
  darkMode?: boolean;
  showPlans?: boolean;
}

export function SubscriptionOverviewSkeleton({
  darkMode = true,
}: {
  darkMode?: boolean;
}) {
  return (
    <div
      className={`min-w-0 space-y-5 rounded-xl border p-4 sm:p-5 ${
        darkMode ? "bg-dark-primary/80 border-gray-800" : "bg-white border-gray-200"
      }`}
      id="subscription_overview_skeleton"
      aria-busy="true"
      aria-label="Loading subscription"
    >
      <Skeleton darkMode={darkMode} className="mb-3 h-3 w-28" />
      <Skeleton darkMode={darkMode} className="mb-2 h-7 w-40" />
      <Skeleton darkMode={darkMode} className="mb-6 h-3 w-56" />
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3">
        <Skeleton darkMode={darkMode} className="h-14 w-full rounded-xl" />
        <Skeleton darkMode={darkMode} className="h-14 w-full rounded-xl" />
        <Skeleton darkMode={darkMode} className="h-14 w-full rounded-xl" />
      </div>
      <div
        className={`grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3 ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <Skeleton darkMode={darkMode} className="h-16 w-full rounded-xl" />
        <Skeleton darkMode={darkMode} className="h-16 w-full rounded-xl" />
        <Skeleton darkMode={darkMode} className="h-16 w-full rounded-xl" />
      </div>
      <div
        className={`grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-2 ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <Skeleton darkMode={darkMode} className="h-24 w-full rounded-xl" />
        <Skeleton darkMode={darkMode} className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SubscriptionPageSkeleton({
  darkMode = true,
  showPlans = true,
}: SubscriptionPageSkeletonProps) {
  return (
    <div className="space-y-8" id="subscription_page_skeleton">
      <SubscriptionOverviewSkeleton darkMode={darkMode} />
      {showPlans && (
        <div
          className={`rounded-xl border p-6 ${
            darkMode ? "bg-dark-primary/80 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <Skeleton darkMode={darkMode} className="mb-2 h-5 w-36" />
          <Skeleton darkMode={darkMode} className="mb-6 h-3 w-72" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton darkMode={darkMode} className="h-64 w-full rounded-xl" />
            <Skeleton darkMode={darkMode} className="h-64 w-full rounded-xl" />
            <Skeleton darkMode={darkMode} className="h-64 w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

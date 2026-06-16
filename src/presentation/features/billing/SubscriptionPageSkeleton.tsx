import React from "react";

function Block({
  darkMode,
  className = "",
}: {
  darkMode: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg animate-pulse ${
        darkMode ? "bg-gray-800/80" : "bg-gray-200"
      } ${className}`}
    />
  );
}

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
      className={`rounded-xl border p-5 ${
        darkMode ? "bg-dark-primary/80 border-gray-800" : "bg-white border-gray-200"
      }`}
      id="subscription_overview_skeleton"
      aria-busy="true"
      aria-label="Chargement de l'abonnement"
    >
      <Block darkMode={darkMode} className="h-3 w-28 mb-3" />
      <Block darkMode={darkMode} className="h-7 w-40 mb-2" />
      <Block darkMode={darkMode} className="h-3 w-56 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Block darkMode={darkMode} className="h-4 w-full" />
        <Block darkMode={darkMode} className="h-4 w-full" />
        <Block darkMode={darkMode} className="h-4 w-full" />
      </div>
      <div
        className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <Block darkMode={darkMode} className="h-10 w-full" />
        <Block darkMode={darkMode} className="h-10 w-full" />
        <Block darkMode={darkMode} className="h-10 w-full" />
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
          <Block darkMode={darkMode} className="h-5 w-36 mb-2" />
          <Block darkMode={darkMode} className="h-3 w-72 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Block darkMode={darkMode} className="h-64 w-full rounded-xl" />
            <Block darkMode={darkMode} className="h-64 w-full rounded-xl" />
            <Block darkMode={darkMode} className="h-64 w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from "react";

export interface SkeletonProps {
  darkMode?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Bloc pulse réutilisable (base du design Pricing). */
export function Skeleton({ darkMode = true, className = "", children }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg animate-pulse ${
        darkMode ? "bg-gray-800/80" : "bg-gray-200"
      } ${className}`}
      aria-hidden={children ? undefined : true}
    >
      {children}
    </div>
  );
}

export function SkeletonField({
  darkMode = true,
  dense = false,
}: {
  darkMode?: boolean;
  dense?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Skeleton darkMode={darkMode} className={`h-3 ${dense ? "w-20" : "w-28"}`} />
      <Skeleton darkMode={darkMode} className={dense ? "h-8 w-full" : "h-10 w-full"} />
    </div>
  );
}

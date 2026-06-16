import type { ReactNode } from "react";
import { Skeleton, SkeletonField } from "@/presentation/components/shared/Skeleton";
import { platform } from "@/presentation/theme/platformStyles";

interface SkeletonLayoutProps {
  darkMode?: boolean;
  id?: string;
  "aria-label"?: string;
}

function SkeletonPanel({
  darkMode = true,
  fields = 4,
  title = true,
  children,
  className = "",
}: SkeletonLayoutProps & {
  fields?: number;
  title?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${platform.panel(darkMode)} ${platform.panelPadding} ${className}`.trim()}>
      {title && (
        <>
          <Skeleton darkMode={darkMode} className="mb-2 h-4 w-44" />
          <Skeleton darkMode={darkMode} className="mb-6 h-3 w-72 max-w-full" />
        </>
      )}
      <div className="space-y-4">
        {Array.from({ length: fields }, (_, i) => (
          <SkeletonField key={i} darkMode={darkMode} />
        ))}
      </div>
      {children}
    </section>
  );
}

export function SimulatorPageSkeleton({ darkMode = true, id = "simulator_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-6" id={id} aria-busy="true" aria-label="Loading simulator">
      <SkeletonPanel darkMode={darkMode} fields={6}>
        <Skeleton darkMode={darkMode} className="mt-6 h-11 w-full" />
      </SkeletonPanel>
    </div>
  );
}

export function SimulatorTaxResultsSkeleton({ darkMode = true }: SkeletonLayoutProps) {
  return (
    <div className="space-y-6 py-2" aria-busy="true" aria-label="Calculating taxes">
      <div className="space-y-3 text-center">
        <Skeleton darkMode={darkMode} className="mx-auto h-3 w-32" />
        <Skeleton darkMode={darkMode} className="mx-auto h-9 w-48" />
        <Skeleton darkMode={darkMode} className="mx-auto h-3 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex justify-between gap-4">
            <Skeleton darkMode={darkMode} className="h-4 w-36" />
            <Skeleton darkMode={darkMode} className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassifierPageSkeleton({ darkMode = true, id = "classifier_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-8" id={id} aria-busy="true" aria-label="Loading classifier">
      <div className="space-y-4">
        <Skeleton darkMode={darkMode} className="h-3 w-40" />
        <Skeleton darkMode={darkMode} className="h-28 w-full rounded-lg" />
        <Skeleton darkMode={darkMode} className="h-11 w-full" />
      </div>
      <ClassifierResultSkeleton darkMode={darkMode} />
    </div>
  );
}

export function ClassifierResultSkeleton({ darkMode = true }: SkeletonLayoutProps) {
  return (
    <div className="space-y-4 border-t pt-8" aria-busy="true" aria-label="Classification in progress">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton darkMode={darkMode} className="h-3 w-28" />
          <Skeleton darkMode={darkMode} className="h-7 w-36" />
        </div>
        <Skeleton darkMode={darkMode} className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton darkMode={darkMode} className="h-2 w-full rounded-full" />
      <Skeleton darkMode={darkMode} className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton darkMode={darkMode} className="h-8 w-20 rounded-full" />
        <Skeleton darkMode={darkMode} className="h-8 w-20 rounded-full" />
        <Skeleton darkMode={darkMode} className="h-8 w-20 rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton darkMode={darkMode} className="h-10 flex-1" />
        <Skeleton darkMode={darkMode} className="h-10 w-32" />
      </div>
    </div>
  );
}

export function HistoryPageSkeleton({ darkMode = true, id = "history_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-8" id={id} aria-busy="true" aria-label="Loading history">
      <SkeletonPanel darkMode={darkMode} fields={0} title={false}>
        <div className="mb-4 flex justify-between">
          <Skeleton darkMode={darkMode} className="h-4 w-32" />
          <Skeleton darkMode={darkMode} className="h-8 w-24" />
        </div>
        <TableRowsSkeleton darkMode={darkMode} rows={6} />
      </SkeletonPanel>
    </div>
  );
}

export function TableRowsSkeleton({
  darkMode = true,
  rows = 5,
}: SkeletonLayoutProps & { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
          <Skeleton darkMode={darkMode} className="h-4 w-16 shrink-0" />
          <Skeleton darkMode={darkMode} className="h-4 flex-1" />
          <Skeleton darkMode={darkMode} className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AfcftaPageSkeleton({ darkMode = true, id = "afcfta_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-5" id={id} aria-busy="true" aria-label="Loading AfCFTA tools">
      <div className="space-y-2">
        <Skeleton darkMode={darkMode} className="h-4 w-52" />
        <Skeleton darkMode={darkMode} className="h-3 w-full max-w-xl" />
      </div>
      <SkeletonPanel darkMode={darkMode} fields={0} title={false}>
        <Skeleton darkMode={darkMode} className="mb-4 h-4 w-48" />
        <ProjectionListSkeleton darkMode={darkMode} items={4} />
      </SkeletonPanel>
      <SkeletonPanel darkMode={darkMode} fields={5} />
      <SkeletonPanel darkMode={darkMode} fields={0} title={false}>
        <Skeleton darkMode={darkMode} className="mb-4 h-4 w-56" />
        <CompareRowsSkeleton darkMode={darkMode} rows={3} />
      </SkeletonPanel>
    </div>
  );
}

export function CameroonPageSkeleton({ darkMode = true, id = "cameroon_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-6" id={id} aria-busy="true" aria-label="Loading Cameroon tools">
      <SkeletonPanel darkMode={darkMode} fields={4} />
      <SkeletonPanel darkMode={darkMode} fields={3} />
    </div>
  );
}

export function BatchPageSkeleton({ darkMode = true, id = "batch_page_skeleton" }: SkeletonLayoutProps) {
  return (
    <div className="space-y-6" id={id} aria-busy="true" aria-label="Loading batch tools">
      <SkeletonPanel darkMode={darkMode} fields={0} title={false}>
        <Skeleton darkMode={darkMode} className="mb-4 h-4 w-40" />
        <Skeleton darkMode={darkMode} className="h-40 w-full rounded-xl border border-dashed" />
        <div className="mt-4 flex gap-3">
          <Skeleton darkMode={darkMode} className="h-10 w-36" />
          <Skeleton darkMode={darkMode} className="h-10 w-36" />
        </div>
      </SkeletonPanel>
    </div>
  );
}

export function BatchResultsSkeleton({ darkMode = true }: SkeletonLayoutProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Processing batch">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} darkMode={darkMode} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <TableRowsSkeleton darkMode={darkMode} rows={5} />
    </div>
  );
}

export function ProjectionListSkeleton({
  darkMode = true,
  items = 5,
}: SkeletonLayoutProps & { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex justify-between gap-4 py-2">
          <Skeleton darkMode={darkMode} className="h-4 w-24" />
          <Skeleton darkMode={darkMode} className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}

export function CompareRowsSkeleton({
  darkMode = true,
  rows = 3,
}: SkeletonLayoutProps & { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <Skeleton darkMode={darkMode} className="h-4 w-32" />
          <div className="flex gap-3">
            <Skeleton darkMode={darkMode} className="h-6 w-20 rounded-full" />
            <Skeleton darkMode={darkMode} className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuthLoadingSkeleton({ darkMode = true }: SkeletonLayoutProps) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center p-8 ${
        darkMode ? "bg-[#101828]" : "bg-gray-50"
      }`}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton darkMode={darkMode} className="h-10 w-10 rounded-full" />
          <Skeleton darkMode={darkMode} className="h-4 w-40" />
        </div>
        <SkeletonPanel darkMode={darkMode} fields={2} title={false} />
      </div>
    </div>
  );
}

export function ApiBannerSkeleton({ darkMode = true }: SkeletonLayoutProps) {
  return (
    <div
      className={`flex items-center gap-3 border-b px-5 py-2.5 ${
        darkMode ? "border-gray-800 bg-dark-primary/80" : "border-gray-100 bg-white/90"
      }`}
      aria-busy="true"
    >
      <Skeleton darkMode={darkMode} className="h-3 w-3 shrink-0 rounded-full" />
      <Skeleton darkMode={darkMode} className="h-3 w-56" />
    </div>
  );
}

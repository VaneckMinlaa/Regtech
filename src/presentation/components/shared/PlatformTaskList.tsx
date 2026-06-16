import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { platform } from "@/presentation/theme/platformStyles";

/* TailAdmin-inspired task list primitives — tabs, grouped rows, metadata chips. */

export function TaskListShell({
  children,
  darkMode = true,
  id,
}: {
  children: ReactNode;
  darkMode?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`overflow-hidden rounded-[20px] border ${platform.border(darkMode)} ${
        darkMode ? "bg-dark-primary" : "bg-white shadow-theme-sm"
      }`}
    >
      {children}
    </div>
  );
}

export function TaskListHeader({
  tabs,
  actions,
  darkMode = true,
}: {
  tabs: ReactNode;
  actions?: ReactNode;
  darkMode?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
        platform.borderSubtle(darkMode)
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">{tabs}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function TaskListTab({
  label,
  count,
  active,
  onClick,
  darkMode = true,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  darkMode?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? darkMode
            ? "bg-primary-500 text-white"
            : "bg-primary-500 text-white shadow-sm"
          : darkMode
            ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      <span
        className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
          active
            ? "bg-white/20 text-white"
            : darkMode
              ? "bg-white/10 text-gray-300"
              : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export function TaskListGroup({
  title,
  count,
  children,
  darkMode = true,
  menu,
}: {
  title: string;
  count: number;
  children: ReactNode;
  darkMode?: boolean;
  menu?: ReactNode;
}) {
  return (
    <div className="border-b last:border-b-0">
      <div
        className={`flex items-center justify-between px-4 py-3 sm:px-5 ${
          darkMode ? "bg-dark-secondary/30" : "bg-gray-50/80"
        }`}
      >
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>{title}</h3>
          <span
            className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
              darkMode ? "bg-white/10 text-gray-300" : "bg-gray-200/80 text-gray-600"
            }`}
          >
            {count}
          </span>
        </div>
        {menu ?? (
          <button
            type="button"
            className={`rounded-lg p-1.5 ${platform.textMuted(darkMode)} hover:bg-black/5 dark:hover:bg-white/5`}
            aria-label={`${title} options`}
            disabled
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <ul className="divide-y">{children}</ul>
    </div>
  );
}

export function TaskListItem({
  title,
  subtitle,
  checked,
  onCheckedChange,
  onClick,
  tags,
  meta,
  trailing,
  darkMode = true,
}: {
  title: string;
  subtitle?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onClick?: () => void;
  tags?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  darkMode?: boolean;
}) {
  const rowClass = `group flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${
    darkMode ? "hover:bg-white/[0.03]" : "hover:bg-gray-50/80"
  }`;

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        {onCheckedChange !== undefined && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onCheckedChange(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:mt-0"
            aria-label={`Select ${title}`}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${platform.textPrimary(darkMode)}`}>{title}</p>
          {subtitle ? (
            <p className={`mt-0.5 truncate text-xs ${platform.textMuted(darkMode)}`}>{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:shrink-0 sm:justify-end">
        {tags}
        {meta}
        {trailing}
      </div>
    </>
  );

  return (
    <li className={platform.borderSubtle(darkMode)}>
      {onClick ? (
        <button type="button" onClick={onClick} className={`cursor-pointer ${rowClass}`}>
          {content}
        </button>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}

export function TaskListTag({
  children,
  tone = "neutral",
  darkMode = true,
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "neutral";
  darkMode?: boolean;
}) {
  const tones = {
    primary: darkMode ? "bg-primary-500/15 text-primary-300" : "bg-primary-50 text-primary-700",
    success: darkMode ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700",
    warning: darkMode ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700",
    neutral: darkMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function TaskListMeta({
  icon,
  children,
  darkMode = true,
}: {
  icon?: ReactNode;
  children: ReactNode;
  darkMode?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${platform.textMuted(darkMode)}`}>
      {icon}
      {children}
    </span>
  );
}

export function TaskListFooter({
  children,
  darkMode = true,
}: {
  children: ReactNode;
  darkMode?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:px-5 ${
        platform.borderSubtle(darkMode)
      } ${platform.textMuted(darkMode)}`}
    >
      {children}
    </div>
  );
}

export function TaskListEmpty({
  children,
  darkMode = true,
}: {
  children: ReactNode;
  darkMode?: boolean;
}) {
  return (
    <p className={`px-4 py-14 text-center text-sm sm:px-5 ${platform.textMuted(darkMode)}`}>{children}</p>
  );
}

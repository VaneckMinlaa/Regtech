import { useState, type ReactNode } from "react";
import { HelpCircle, Loader2 } from "lucide-react";
import { platform } from "@/presentation/theme/platformStyles";

interface HelpToggleProps {
  label: string;
  darkMode?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Section title shown on the left; help button aligns to the right (HS classification style). */
  title?: string;
  description?: string;
  children: ReactNode;
}

/** Help trigger — standalone or paired with a section title on the same row. */
export function HelpToggle({
  label,
  darkMode = true,
  loading = false,
  disabled = false,
  title,
  description,
  children,
}: HelpToggleProps) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      disabled={disabled}
      aria-expanded={open}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded shrink-0 ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : `hover:text-primary-500 ${platform.textMuted(darkMode)}`
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {label}
    </button>
  );

  return (
    <div id="help_toggle">
      {title ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold ${platform.textPrimary(darkMode)}`}>{title}</h2>
            {description ? (
              <p className={`mt-1 text-sm leading-relaxed ${platform.textMuted(darkMode)}`}>{description}</p>
            ) : null}
          </div>
          {trigger}
        </div>
      ) : (
        trigger
      )}

      {open && !disabled && (
        <div
          className={`${title ? "mt-4" : "mt-4"} space-y-3 text-sm leading-relaxed border-t pt-4 ${platform.borderSubtle(darkMode)} ${platform.textSecondary(darkMode)}`}
          role="region"
        >
          {children}
        </div>
      )}
    </div>
  );
}

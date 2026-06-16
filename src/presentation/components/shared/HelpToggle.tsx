import { useState, type ReactNode } from "react";
import { HelpCircle, Loader2 } from "lucide-react";
import { platform } from "@/presentation/theme/platformStyles";

interface HelpToggleProps {
  label: string;
  darkMode?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/** Help trigger styled like "What is the HS code?" — expands inline explanation on click. */
export function HelpToggle({
  label,
  darkMode = true,
  loading = false,
  disabled = false,
  children,
}: HelpToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div id="help_toggle">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded ${
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

      {open && !disabled && (
        <div
          className={`mt-4 space-y-3 text-sm leading-relaxed border-t pt-4 ${platform.borderSubtle(darkMode)} ${platform.textSecondary(darkMode)}`}
          role="region"
        >
          {children}
        </div>
      )}
    </div>
  );
}

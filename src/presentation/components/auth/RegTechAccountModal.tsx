import { useEffect } from "react";
import { createPortal } from "react-dom";
import { UserProfile } from "@clerk/react";
import { X } from "lucide-react";
import { clerkProfileAppearance } from "@/presentation/providers/clerkAppearance";
import { platform } from "@/presentation/theme/platformStyles";

interface RegTechAccountModalProps {
  open: boolean;
  darkMode: boolean;
  onClose: () => void;
}

export function RegTechAccountModal({ open, darkMode, onClose }: RegTechAccountModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user_profile_title"
      id="user_profile_modal"
    >
      <button
        type="button"
        className={`absolute inset-0 ${platform.overlay} backdrop-blur-sm`}
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-theme-lg ${
          darkMode ? "bg-dark-primary border-gray-800" : "bg-white border-gray-100"
        }`}
        style={{ height: "min(88vh, 800px)" }}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${platform.border(darkMode)}`}
        >
          <div>
            <h2
              id="user_profile_title"
              className={`text-base font-bold font-display ${platform.textPrimary(darkMode)}`}
            >
              My account
            </h2>
            <p className={`text-xs mt-0.5 ${platform.textMuted(darkMode)}`}>
              Profile, security, and connected accounts
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg border p-1.5 transition-colors ${platform.buttonGhost(darkMode)}`}
            aria-label="Close profile"
            id="btn_close_profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="regtech-user-profile min-h-0 flex-1 overflow-hidden">
          <UserProfile routing="hash" appearance={clerkProfileAppearance(darkMode)} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

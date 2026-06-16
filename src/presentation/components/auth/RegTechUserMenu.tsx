import { useCallback, useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { LogOut, Settings, GraduationCap } from "lucide-react";
import { RegTechAccountModal } from "@/presentation/components/auth/RegTechAccountModal";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { platform } from "@/presentation/theme/platformStyles";

function getUserInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallbackName?: string | null,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  if (first || last) return `${first}${last}`.toUpperCase();
  const fallback = fallbackName?.trim().charAt(0);
  return fallback ? fallback.toUpperCase() : "U";
}

function UserAvatar({
  imageUrl,
  initials,
  size = "md",
}: {
  imageUrl?: string | null;
  initials: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover ring-2 ring-primary-500/30`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} inline-flex items-center justify-center rounded-full bg-primary-500 text-white font-semibold font-display ring-2 ring-primary-500/30`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function RegTechUserMenu({ onStartTour }: { onStartTour?: () => void } = {}) {
  const { darkMode } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = getUserInitials(user?.firstName, user?.lastName, displayName);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  const menuItemClass = `w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
    darkMode
      ? "text-gray-200 hover:bg-white/5"
      : "text-gray-700 hover:bg-gray-50"
  }`;

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          id="btn_user_menu"
          title={displayName}
        >
          <UserAvatar imageUrl={user?.imageUrl} initials={initials} size="sm" />
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className={`absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border shadow-theme-lg animate-fadeIn ${
              darkMode
                ? "bg-dark-primary border-gray-800"
                : "bg-white border-gray-100"
            }`}
            id="user_menu_dropdown"
          >
            <div className={`flex items-center gap-3 border-b px-4 py-4 ${platform.border(darkMode)}`}>
              <UserAvatar imageUrl={user?.imageUrl} initials={initials} size="lg" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold font-display ${platform.textPrimary(darkMode)}`}>
                  {displayName}
                </p>
                {email ? (
                  <p className={`truncate text-xs mt-0.5 ${platform.textMuted(darkMode)}`}>{email}</p>
                ) : null}
              </div>
            </div>

            <div className="py-1.5">
              {onStartTour ? (
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    closeMenu();
                    onStartTour();
                  }}
                  id="btn_platform_guide"
                >
                  <GraduationCap className={`w-4 h-4 shrink-0 ${platform.textMuted(darkMode)}`} />
                  Platform guide
                </button>
              ) : null}

              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  closeMenu();
                  setProfileOpen(true);
                }}
                id="btn_manage_account"
              >
                <Settings className={`w-4 h-4 shrink-0 ${platform.textMuted(darkMode)}`} />
                My account
              </button>

              <button
                type="button"
                role="menuitem"
                className={`${menuItemClass} ${
                  darkMode
                    ? "text-rose-300 hover:bg-rose-500/10"
                    : "text-rose-600 hover:bg-rose-50"
                }`}
                onClick={() => {
                  closeMenu();
                  void signOut();
                }}
                id="btn_sign_out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <RegTechAccountModal
        open={profileOpen}
        darkMode={darkMode}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}

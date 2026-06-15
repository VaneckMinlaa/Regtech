import { dark, experimental_createTheme } from "@clerk/themes";

const fontFamily = '"Inter", ui-sans-serif, system-ui, sans-serif';
const fontDisplay = '"Space Grotesk", sans-serif';

const PRIMARY = "#7a5af8";
const PRIMARY_HOVER = "#6938ef";

const sharedAuthElements = {
  rootBox: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  card: {
    borderRadius: "24px",
    boxShadow: "0px 32px 100px -12px rgba(16, 24, 40, 0.05)",
    padding: "2rem 2rem 2.5rem",
  },
  cardBox: {
    borderRadius: "24px",
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: "1.875rem",
    fontWeight: "700",
    lineHeight: "2.25rem",
  },
  headerSubtitle: {
    fontSize: "0.9375rem",
  },
  socialButtonsBlockButton: {
    borderRadius: "9999px",
    minHeight: "3rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    boxShadow: "none",
  },
  socialButtonsBlockButtonText: {
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  dividerLine: {
    backgroundColor: "transparent",
  },
  dividerText: {
    fontSize: "0.875rem",
  },
  formFieldLabel: {
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  formFieldInput: {
    borderRadius: "0.75rem",
    minHeight: "3rem",
    fontSize: "0.875rem",
  },
  formButtonPrimary: {
    borderRadius: "9999px",
    minHeight: "3rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    backgroundImage: `linear-gradient(97deg, ${PRIMARY} 0%, #b5b1ff 140.21%)`,
    backgroundColor: PRIMARY,
    boxShadow: "none",
    "&:hover": {
      backgroundImage: `linear-gradient(97deg, #b5b1ff 0%, ${PRIMARY} 140.21%)`,
      backgroundColor: PRIMARY_HOVER,
    },
  },
  footerActionLink: {
    fontWeight: "600",
    "&:hover": {
      opacity: "0.85",
    },
  },
  footerActionText: {
    fontSize: "0.875rem",
  },
  identityPreview: {
    borderRadius: "0.75rem",
  },
  formFieldInputShowPasswordButton: {
    borderRadius: "0.5rem",
  },
  otpCodeFieldInput: {
    borderRadius: "0.75rem",
  },
  alternativeMethodsBlockButton: {
    borderRadius: "9999px",
  },
  backLink: {
    fontSize: "0.875rem",
  },
};

const regtechDarkTheme = experimental_createTheme({
  name: "regtech-dark",
  baseTheme: dark,
  variables: {
    fontFamily,
    borderRadius: "0.75rem",
    colorBackground: "#101828",
    colorInput: "#1a2231",
    colorInputForeground: "#f1f5f9",
    colorForeground: "#f1f5f9",
    colorMutedForeground: "#94a3b8",
    colorNeutral: "#e2e8f0",
    colorPrimary: PRIMARY,
    colorPrimaryForeground: "#ffffff",
    colorDanger: "#f43f5e",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorModalBackdrop: "rgba(16, 24, 40, 0.75)",
    colorRing: PRIMARY,
  },
  elements: {
    ...sharedAuthElements,
    card: {
      ...sharedAuthElements.card,
      backgroundColor: "#171f2e",
      border: "1px solid rgba(255, 255, 255, 0.06)",
    },
    cardBox: {
      backgroundColor: "#171f2e",
      borderRadius: "24px",
    },
    headerTitle: {
      ...sharedAuthElements.headerTitle,
      color: "rgba(255, 255, 255, 0.9)",
    },
    headerSubtitle: {
      color: "#94a3b8",
    },
    socialButtonsBlockButton: {
      ...sharedAuthElements.socialButtonsBlockButton,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      color: "rgba(255, 255, 255, 0.9)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    formFieldInput: {
      ...sharedAuthElements.formFieldInput,
      backgroundColor: "#1a2231",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#f1f5f9",
    },
    footerActionLink: {
      ...sharedAuthElements.footerActionLink,
      color: "#9b8afb",
    },
    identityPreview: {
      backgroundColor: "#1a2231",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    userButtonPopoverCard: {
      backgroundColor: "#171f2e",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    userButtonPopoverMain: {
      backgroundColor: "#171f2e",
    },
    userButtonPopoverActions: {
      backgroundColor: "#171f2e",
      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    },
    userButtonPopoverActionButton: {
      color: "#f1f5f9",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
      },
    },
    userButtonPopoverActionButtonIcon: {
      color: "#94a3b8",
    },
    userButtonPopoverFooter: {
      display: "none",
    },
    userPreviewMainIdentifier: {
      color: "#f8fafc",
    },
    userPreviewSecondaryIdentifier: {
      color: "#94a3b8",
    },
    modalContent: {
      backgroundColor: "#171f2e",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    },
    navbar: {
      backgroundColor: "#101828",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    },
    navbarButton: {
      color: "#94a3b8",
      "&:hover": {
        color: "#f1f5f9",
      },
    },
    profileSection: {
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    },
    profileSectionTitle: {
      color: "#94a3b8",
    },
    menuButton: {
      color: "#f1f5f9",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
      },
    },
    menuList: {
      backgroundColor: "#171f2e",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    },
    menuItem: {
      color: "#f1f5f9",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
      },
    },
    badge: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      color: "#94a3b8",
    },
    providerIcon__apple: { filter: "invert(1)" },
    providerIcon__github: { filter: "invert(1)" },
    providerIcon__vercel: { filter: "invert(1)" },
    footer: { display: "none" },
    footerPages: { display: "none" },
  },
});

const regtechLightTheme = experimental_createTheme({
  name: "regtech-light",
  variables: {
    fontFamily,
    borderRadius: "0.75rem",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#111827",
    colorForeground: "#111827",
    colorMutedForeground: "#6b7280",
    colorNeutral: "#111827",
    colorPrimary: PRIMARY,
    colorPrimaryForeground: "#ffffff",
    colorDanger: "#e11d48",
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorModalBackdrop: "rgba(17, 24, 39, 0.4)",
    colorRing: PRIMARY,
  },
  elements: {
    ...sharedAuthElements,
    card: {
      ...sharedAuthElements.card,
      backgroundColor: "#ffffff",
      border: "1px solid #f3f4f6",
    },
    cardBox: {
      backgroundColor: "#ffffff",
      borderRadius: "24px",
    },
    headerTitle: {
      ...sharedAuthElements.headerTitle,
      color: "#111827",
    },
    headerSubtitle: {
      color: "#6b7280",
    },
    socialButtonsBlockButton: {
      ...sharedAuthElements.socialButtonsBlockButton,
      backgroundColor: "#f3f4f6",
      border: "1px solid #e5e7eb",
      color: "#374151",
      "&:hover": {
        backgroundColor: "#e5e7eb",
        color: "#111827",
      },
    },
    formFieldInput: {
      ...sharedAuthElements.formFieldInput,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      color: "#111827",
    },
    footerActionLink: {
      ...sharedAuthElements.footerActionLink,
      color: PRIMARY,
    },
    userButtonPopoverCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
    },
    userButtonPopoverMain: {
      backgroundColor: "#ffffff",
    },
    userButtonPopoverActions: {
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e5e7eb",
    },
    userButtonPopoverActionButton: {
      color: "#111827",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
    userButtonPopoverFooter: {
      display: "none",
    },
    userPreviewMainIdentifier: {
      color: "#111827",
    },
    userPreviewSecondaryIdentifier: {
      color: "#6b7280",
    },
    modalContent: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    },
    navbar: {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    menuButton: {
      color: "#111827",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
    menuList: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    },
    menuItem: {
      color: "#111827",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
    footer: { display: "none" },
    footerPages: { display: "none" },
  },
});

export function clerkAppearance(darkMode: boolean) {
  return {
    baseTheme: darkMode ? regtechDarkTheme : regtechLightTheme,
    layout: {
      socialButtonsPlacement: "top",
      socialButtonsVariant: "blockButton",
      showOptionalFields: true,
    },
  };
}

const profileEmbedElements = {
  rootBox: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    margin: "0",
    boxShadow: "none",
  },
  cardBox: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    borderRadius: "0",
    boxShadow: "none",
    border: "none",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: "0",
    boxShadow: "none",
    border: "none",
    padding: "0",
  },
  pageScrollBox: {
    flex: "1 1 auto",
    minHeight: "0",
  },
  scrollBox: {
    height: "100%",
  },
  navbar: {
    borderRadius: "0",
  },
};

export function clerkProfileAppearance(darkMode: boolean) {
  return {
    ...clerkAppearance(darkMode),
    elements: profileEmbedElements,
  };
}

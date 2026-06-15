type FinalizeResource = {
  finalize: (params: {
    navigate: (args: {
      session?: { currentTask?: { key: string } };
      decorateUrl: (path: string) => string;
    }) => void;
  }) => Promise<{ error?: { message?: string } | null } | void>;
};

export async function finalizeAuth(resource: FinalizeResource) {
  await resource.finalize({
    navigate: ({ session, decorateUrl }) => {
      if (session?.currentTask) {
        console.warn("Tâche de session en attente :", session.currentTask);
      }
      const url = decorateUrl("/");
      if (url.startsWith("http")) {
        window.location.href = url;
        return;
      }
      window.history.replaceState(null, "", url || "/");
    },
  });
}

export function ssoCallbackUrl() {
  return `${window.location.origin}${window.location.pathname}#sso-callback`;
}

export function ssoRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

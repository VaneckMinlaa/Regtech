import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8000";
  const newsApiKey = env.NEWS_API_KEY || env.VITE_NEWS_API_KEY || "";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/news-api": {
          target: "https://newsapi.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/news-api/, ""),
          configure: (proxy) => {
            if (!newsApiKey) return;
            proxy.on("proxyReq", (proxyReq, req) => {
              const raw = req.url ?? "";
              const qIndex = raw.indexOf("?");
              const pathPart = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
              const search = qIndex >= 0 ? raw.slice(qIndex + 1) : "";
              const params = new URLSearchParams(search);
              if (!params.has("apiKey")) params.set("apiKey", newsApiKey);
              proxyReq.path = `${pathPart}?${params.toString()}`;
            });
          },
        },
      },
    },
  };
});

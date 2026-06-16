import path from "path";
import type { ServerResponse } from "http";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

function tradeNewsDevApi(apiKey: string): Plugin {
  return {
    name: "trade-news-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/trade-news") return next();

        const httpRes = res as ServerResponse;
        const sendJson = (status: number, body: unknown) => {
          httpRes.statusCode = status;
          httpRes.setHeader("Content-Type", "application/json");
          httpRes.end(JSON.stringify(body));
        };

        if (!apiKey) {
          sendJson(503, { articles: [], error: "NEWS_API_KEY is not configured" });
          return;
        }

        try {
          const { loadTradeNewsFromNewsApi } = await import("./api/_lib/tradeNewsCore.ts");
          const articles = await loadTradeNewsFromNewsApi(apiKey);
          sendJson(200, { articles });
        } catch {
          sendJson(502, { articles: [], error: "NewsAPI request failed" });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8000";
  const newsApiKey = env.NEWS_API_KEY || env.VITE_NEWS_API_KEY || "";

  return {
    plugins: [tradeNewsDevApi(newsApiKey), react(), tailwindcss()],
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
          bypass(req) {
            if (req.url?.split("?")[0] === "/api/trade-news") return req.url;
          },
        },
      },
    },
  };
});

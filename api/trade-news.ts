import { loadTradeNewsFromNewsApi } from "../shared/tradeNewsCore";

interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY || "";

  if (!apiKey) {
    res.status(503).json({ articles: [], error: "NEWS_API_KEY is not configured" });
    return;
  }

  try {
    const articles = await loadTradeNewsFromNewsApi(apiKey);
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json({ articles });
  } catch {
    res.status(502).json({ articles: [], error: "NewsAPI request failed" });
  }
}

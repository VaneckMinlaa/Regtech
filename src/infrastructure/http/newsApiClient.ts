/** NewsAPI client — calls same-origin `/api/trade-news` (Vite dev plugin + Vercel serverless). */

export type { TradeNewsArticle } from "./tradeNewsTypes";
export { formatNewsDate } from "./newsApiFormat";

const CACHE_KEY = "regtech_trade_news_v2";
const CACHE_TTL_MS = 30 * 60 * 1000;

function readCache(): import("./tradeNewsTypes").TradeNewsArticle[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, items } = JSON.parse(raw) as {
      at: number;
      items: import("./tradeNewsTypes").TradeNewsArticle[];
    };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return items;
  } catch {
    return null;
  }
}

function writeCache(items: import("./tradeNewsTypes").TradeNewsArticle[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* quota */
  }
}

/** Returns up to 3 relevant articles, or [] if none / API unavailable. */
export async function fetchTradeNews(): Promise<import("./tradeNewsTypes").TradeNewsArticle[]> {
  const cached = readCache();
  if (cached?.length) return cached;

  const res = await fetch("/api/trade-news");
  if (!res.ok) return [];

  const data = (await res.json()) as {
    articles?: import("./tradeNewsTypes").TradeNewsArticle[];
  };
  const articles = data.articles ?? [];

  if (articles.length > 0) writeCache(articles);
  return articles;
}

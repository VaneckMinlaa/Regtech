/** NewsAPI.org client — trade, customs & AfCFTA headlines for the landing page. */

export interface TradeNewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  tag: string;
}

const CACHE_KEY = "regtech_trade_news_v1";
const CACHE_TTL_MS = 30 * 60 * 1000;

const RELEVANCE_KEYWORDS = [
  "afcfta",
  "af-cfta",
  "zlecaf",
  "zleca",
  "continental free trade",
  "free trade area",
  "african trade",
  "intra-african",
  "intra african",
  "customs",
  "custom",
  "douane",
  "douanes",
  "tariff",
  "tariffs",
  "import duty",
  "harmonized system",
  "hs code",
  "cemac",
  "uemoa",
  "trade agreement",
  "border trade",
  "cross-border",
  "export africa",
  "import africa",
];

const SEARCH_QUERIES = [
  "AfCFTA OR ZLECAF OR African Continental Free Trade Area",
  "Africa customs OR African tariffs OR intra-African trade",
];

interface NewsApiArticle {
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  source?: { name?: string };
}

interface NewsApiResponse {
  status: string;
  totalResults?: number;
  articles?: NewsApiArticle[];
}

function isRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return RELEVANCE_KEYWORDS.some((kw) => lower.includes(kw));
}

function deriveTag(title: string, description: string): string {
  const blob = `${title} ${description}`.toLowerCase();
  if (blob.includes("afcfta") || blob.includes("zlecaf") || blob.includes("zleca")) {
    return "AfCFTA • TRADE";
  }
  if (blob.includes("custom") || blob.includes("douane")) {
    return "CUSTOMS • REGULATION";
  }
  if (blob.includes("tariff") || blob.includes("duty")) {
    return "TARIFFS • POLICY";
  }
  return "AFRICA • TRADE";
}

function normalizeArticle(raw: NewsApiArticle, index: number): TradeNewsArticle | null {
  const title = raw.title?.trim();
  const url = raw.url?.trim();
  if (!title || !url || title === "[Removed]") return null;

  const description = raw.description?.trim() || "";
  const combined = `${title} ${description}`;
  if (!isRelevant(combined)) return null;

  const imageUrl = raw.urlToImage?.trim() || null;
  const validImage = imageUrl && !imageUrl.includes("removed") ? imageUrl : null;

  return {
    id: `${index}-${url}`,
    title,
    description: description.replace(/<[^>]+>/g, "").slice(0, 220),
    url,
    imageUrl: validImage,
    source: raw.source?.name?.trim() || "News",
    publishedAt: raw.publishedAt || "",
    tag: deriveTag(title, description),
  };
}

function dedupe(articles: TradeNewsArticle[]): TradeNewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readCache(): TradeNewsArticle[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, items } = JSON.parse(raw) as { at: number; items: TradeNewsArticle[] };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return items;
  } catch {
    return null;
  }
}

function writeCache(items: TradeNewsArticle[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* quota */
  }
}

async function fetchQuery(q: string): Promise<NewsApiArticle[]> {
  const params = new URLSearchParams({
    q,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "15",
  });

  const res = await fetch(`/news-api/v2/everything?${params.toString()}`);
  if (!res.ok) return [];

  const data = (await res.json()) as NewsApiResponse;
  if (data.status !== "ok" || !data.articles?.length) return [];
  return data.articles;
}

/** Returns up to 3 relevant articles, or [] if none / API unavailable. */
export async function fetchTradeNews(): Promise<TradeNewsArticle[]> {
  const cached = readCache();
  if (cached?.length) return cached;

  const batches = await Promise.all(SEARCH_QUERIES.map((q) => fetchQuery(q)));
  const merged = batches.flat();

  const normalized = dedupe(
    merged
      .map((raw, i) => normalizeArticle(raw, i))
      .filter((a): a is TradeNewsArticle => a !== null),
  ).slice(0, 3);

  if (normalized.length > 0) writeCache(normalized);
  return normalized;
}

export function formatNewsDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

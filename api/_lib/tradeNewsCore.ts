/** NewsAPI fetch + relevance filter (Vercel serverless + Vite dev middleware). */

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
  "Cameroon OR Nigeria OR Ghana trade OR import export Africa",
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
  if (blob.includes("customs") || blob.includes("douane")) {
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
  if (!isRelevant(`${title} ${description}`)) return null;

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

async function fetchQuery(apiKey: string, q: string): Promise<NewsApiArticle[]> {
  const params = new URLSearchParams({
    q,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "15",
    apiKey,
  });

  const res = await fetch(`https://newsapi.org/v2/everything?${params.toString()}`);
  if (!res.ok) return [];

  const data = (await res.json()) as NewsApiResponse;
  if (data.status !== "ok" || !data.articles?.length) return [];
  return data.articles;
}

/** Load up to 3 trade/customs headlines from NewsAPI.org. */
export async function loadTradeNewsFromNewsApi(apiKey: string): Promise<TradeNewsArticle[]> {
  if (!apiKey.trim()) return [];

  const batches = await Promise.all(SEARCH_QUERIES.map((q) => fetchQuery(apiKey, q)));
  const merged = batches.flat();

  const seen = new Set<string>();
  const articles: TradeNewsArticle[] = [];

  for (const raw of merged) {
    const normalized = normalizeArticle(raw, articles.length);
    if (!normalized) continue;
    const key = normalized.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    articles.push(normalized);
    if (articles.length >= 3) break;
  }

  return articles;
}

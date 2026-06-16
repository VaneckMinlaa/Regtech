import { loadTradeNewsFromNewsApi } from "./_lib/tradeNewsCore";

export async function GET() {
  try {
    const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY || "";

    if (!apiKey) {
      return Response.json(
        { articles: [], error: "NEWS_API_KEY is not configured" },
        { status: 503 },
      );
    }

    const articles = await loadTradeNewsFromNewsApi(apiKey);
    return Response.json(
      { articles },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "NewsAPI request failed";
    console.error("[trade-news]", message);
    return Response.json({ articles: [], error: message }, { status: 502 });
  }
}

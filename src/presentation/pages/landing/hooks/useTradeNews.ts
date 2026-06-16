import { useEffect, useState } from "react";
import { fetchTradeNews, type TradeNewsArticle } from "@/infrastructure/http/newsApiClient";

export function useTradeNews() {
  const [articles, setArticles] = useState<TradeNewsArticle[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchTradeNews()
      .then((items) => {
        if (!cancelled) setArticles(items);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, ready, hasNews: articles.length > 0 };
}

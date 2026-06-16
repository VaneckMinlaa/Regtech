import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "motion/react";
import { formatNewsDate, type TradeNewsArticle } from "@/infrastructure/http/newsApiClient";
import { LandingReveal } from "../components/LandingReveal";
import { landingEase } from "../motion/landingMotion";
import { useTradeNews } from "../hooks/useTradeNews";

function SideCard({
  article,
  gradient,
}: {
  article: TradeNewsArticle;
  gradient: string;
}) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[200px] flex-1 overflow-hidden rounded-[24px] p-6 sm:min-h-[220px] ${gradient}`}
    >
      <div className="relative z-10 flex max-w-[65%] flex-col justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
            {article.tag}
          </p>
          <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-snug text-white sm:text-xl">
            {article.title}
          </h3>
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition group-hover:gap-2.5">
          Read article
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt=""
          className="absolute -bottom-4 -right-2 h-36 w-36 object-cover opacity-90 mix-blend-lighten sm:h-44 sm:w-44"
          loading="lazy"
        />
      ) : (
        <Newspaper className="absolute bottom-4 right-4 h-16 w-16 text-white/20" aria-hidden />
      )}
    </a>
  );
}

function FeaturedCard({ article, tall = true }: { article: TradeNewsArticle; tall?: boolean }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-[#1e3a8a] p-6 sm:p-8 ${
        tall ? "min-h-[320px] sm:min-h-[460px] h-full" : "min-h-[280px]"
      }`}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.25, ease: landingEase }}
    >
      <div className="relative z-10 max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
          {article.tag}
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          {article.title}
        </h2>
        {article.description ? (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/75 sm:text-base">
            {article.description}
          </p>
        ) : null}
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1e3a8a] transition group-hover:bg-white/95">
          Read more
          <ArrowRight className="h-4 w-4" />
        </span>
        <p className="mt-4 text-xs text-white/50">
          {article.source}
          {article.publishedAt ? ` · ${formatNewsDate(article.publishedAt)}` : ""}
        </p>
      </div>

      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt=""
          className="absolute bottom-0 right-0 h-48 w-48 object-contain object-bottom opacity-95 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
          loading="lazy"
        />
      ) : null}

      <div className="absolute bottom-6 left-6 flex gap-2 sm:bottom-8 sm:left-8" aria-hidden>
        <span className="h-1 w-8 rounded-full bg-white" />
        <span className="h-1 w-4 rounded-full bg-white/35" />
        <span className="h-1 w-4 rounded-full bg-white/35" />
      </div>
    </motion.a>
  );
}

export function CustomsNewsSection() {
  const { articles, ready, hasNews } = useTradeNews();

  if (!ready || !hasNews) return null;

  const [featured, second, third] = articles;
  const multiLayout = articles.length >= 2;

  return (
    <section id="trade-news" className="px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-[72rem]">
        <LandingReveal className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Trade intelligence</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">
            Latest customs & AfCFTA news
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            Headlines on African trade, tariffs, and regional integration — curated for RegTech users.
          </p>
        </LandingReveal>

        <div
          className={
            multiLayout
              ? "grid gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:gap-5"
              : "max-w-3xl mx-auto"
          }
        >
          {featured && (
            <div className={multiLayout ? "lg:col-span-2 lg:row-span-2" : ""}>
              <FeaturedCard article={featured} tall={multiLayout} />
            </div>
          )}

          {multiLayout && (second || third) ? (
            <div className="flex flex-col gap-4 lg:col-span-1 lg:row-span-2 lg:gap-5">
              {second && (
                <SideCard
                  article={second}
                  gradient="bg-gradient-to-br from-[#7a5af8] via-[#9333ea] to-[#c026d3]"
                />
              )}
              {third && (
                <SideCard
                  article={third}
                  gradient="bg-gradient-to-br from-[#0d9488] via-[#0891b2] to-[#2563eb]"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

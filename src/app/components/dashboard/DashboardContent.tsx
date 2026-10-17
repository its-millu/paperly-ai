
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  ExternalLink,
  FileText,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Brain,
  Check,
  SlidersHorizontal,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
};

type NewsResponse = {
  articles: Article[];
  count: number;
  generatedAt: string;
  interests: string[];
  sources: string[];
  error?: string;
  redirect?: string;
};

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function isSafeArticleUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function DashboardContent() {
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState("For You");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadNews = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/news", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const data: NewsResponse = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (response.status === 409 && data.redirect === "/onboarding") {
        window.location.assign("/onboarding");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your news.");
      }

      if (!Array.isArray(data.articles)) {
        throw new Error("The news service returned an invalid response.");
      }

      setNews(data);

      // Avoid leaving the user on a category that no longer exists.
      setActiveCategory((current) =>
        current === "For You" ||
        data.articles.some((article) => article.category === current)
          ? current
          : "For You",
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your news.",
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadNews(controller.signal);

    return () => controller.abort();
  }, [loadNews, refreshKey]);

  const categories = useMemo(() => {
    const available = [
      ...new Set((news?.articles ?? []).map((article) => article.category)),
    ];

    return ["For You", ...available];
  }, [news]);

  const filteredArticles = useMemo(() => {
    const articles = news?.articles ?? [];

    if (activeCategory === "For You") return articles;

    return articles.filter(
      (article) => article.category === activeCategory,
    );
  }, [news, activeCategory]);

  function refreshNews() {
    if (loading || refreshing) return;

    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="paperly-neo space-y-7 sm:space-y-9">
      {/* Animated neumorphic welcome panel */}
      <section className="paperly-hero relative overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:p-10">
        <div className="paperly-hero-orb paperly-hero-orb-one" />
        <div className="paperly-hero-orb paperly-hero-orb-two" />

        <div className="relative z-10 max-w-3xl">
          <span className="paperly-hero-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:text-xs">
            <Sparkles size={15} />
            Your personalized newsroom
          </span>

          <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
            Your world.
            <br />
            <span className="paperly-gradient-text">
              Your daily paper.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Real stories selected around your interests. Discover new ideas,
            explore original reporting, and stay informed without the noise.
          </p>

          {news?.interests && news.interests.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {news.interests.map((interest) => (
                <span
                  key={interest}
                  className="paperly-interest-pill rounded-full px-3 py-1.5 text-xs font-semibold text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={refreshNews}
            disabled={loading || refreshing}
            className="paperly-primary-button mt-7 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing your paper..." : "Refresh my paper"}
          </button>
        </div>

        <div className="paperly-hero-document absolute bottom-8 right-10 hidden h-28 w-28 items-center justify-center rounded-[1.75rem] text-indigo-600 lg:flex">
          <FileText size={46} strokeWidth={1.4} />
          <span className="paperly-document-spark">
            <Sparkles size={18} />
          </span>
        </div>
      </section>

      {/* Statistics */}
      <section
        aria-label="Your newspaper statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Articles available"
          value={loading ? "—" : String(news?.count ?? 0)}
          detail="Stories in your current paper"
          icon={BookOpen}
          accent="indigo"
          index={0}
        />

        <StatCard
          title="News sources"
          value={loading ? "—" : String(news?.sources.length ?? 0)}
          detail="Sources contributing to your paper"
          icon={TrendingUp}
          accent="amber"
          index={1}
        />

        <StatCard
          title="Topics followed"
          value={loading ? "—" : String(news?.interests.length ?? 0)}
          detail="Your saved interests"
          icon={Sparkles}
          accent="violet"
          index={2}
        />

        <StatCard
          title="Your edition"
          value="Daily"
          detail="Personalized news, in one place"
          icon={Clock3}
          accent="emerald"
          index={3}
        />
      </section>

      {/* Newsroom heading and filters */}
      <section id="latest-stories" className="scroll-mt-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-600">
              <span className="paperly-heading-dot" />
              Your newsroom
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
              Today&apos;s briefing
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Explore stories selected around your interests.
            </p>
          </div>

          {news?.generatedAt && (
            <div className="paperly-inset inline-flex items-center gap-2 self-start rounded-xl px-3 py-2.5 text-xs text-slate-500 sm:self-auto">
              <Clock3 size={14} className="text-indigo-500" />
              Updated{" "}
              {new Date(news.generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {/* Category filters */}
        {!loading && !error && categories.length > 1 && (
          <div className="paperly-filter-bar mt-6 flex items-center gap-2 overflow-x-auto rounded-2xl p-2.5">
            <span className="ml-1 hidden shrink-0 items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 md:inline-flex">
              <SlidersHorizontal size={14} />
              Filter
            </span>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`paperly-filter-chip shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  activeCategory === category
                    ? "paperly-filter-active"
                    : "text-slate-500 hover:text-indigo-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading news articles"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="paperly-skeleton-card rounded-[1.75rem] p-5 sm:p-6"
              >
                <div className="paperly-skeleton h-6 w-24 rounded-full" />
                <div className="paperly-skeleton mt-6 h-5 w-full rounded-lg" />
                <div className="paperly-skeleton mt-3 h-5 w-4/5 rounded-lg" />
                <div className="paperly-skeleton mt-5 h-3 w-1/3 rounded-lg" />
                <div className="paperly-skeleton mt-6 h-16 rounded-xl" />
                <div className="paperly-skeleton mt-6 h-9 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="paperly-message-card mt-6 rounded-[1.75rem] p-6 sm:p-8">
            <div className="paperly-message-icon paperly-error-icon flex h-12 w-12 items-center justify-center rounded-2xl">
              <RefreshCw size={22} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-800">
              We couldn&apos;t load your paper
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

            <button
              type="button"
              onClick={refreshNews}
              disabled={refreshing}
              className="paperly-secondary-button mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-indigo-700"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Try again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="paperly-message-card mt-6 rounded-[1.75rem] p-8 text-center sm:p-12">
            <div className="paperly-empty-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-indigo-500">
              <FileText size={29} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-800">
              No articles available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no stories in this category right now. Try another
              category or refresh your paper.
            </p>

            <button
              type="button"
              onClick={refreshNews}
              disabled={refreshing}
              className="paperly-primary-button mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            >
              <RefreshCw size={16} />
              Refresh news
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article, index) => (
              <article
                key={article.id}
                style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}
                className="paperly-news-card group flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="paperly-category-badge inline-flex max-w-[65%] items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold text-indigo-700">
                    <span className="paperly-category-dot" />
                    <span className="truncate">{article.category}</span>
                  </span>

                  <span className="shrink-0 pt-1 text-right text-[10px] font-medium text-slate-400">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-extrabold leading-snug tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-indigo-700">
                  {article.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                  {article.summary ||
                    "Open the original source to read this story."}
                </p>

                <div className="paperly-article-footer mt-6 flex items-center justify-between gap-3 pt-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="paperly-source-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-indigo-600">
                      <BookOpen size={16} />
                    </span>

                    <span className="truncate text-xs font-bold text-slate-600">
                      {article.source}
                    </span>
                  </div>

                  {isSafeArticleUrl(article.url) ? (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paperly-read-link inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-indigo-700"
                    >
                      Read story
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Link unavailable
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredArticles.length > 0 && (
          <p className="mt-5 text-center text-xs text-slate-400">
            Showing {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "story" : "stories"}
            {activeCategory !== "For You" ? ` in ${activeCategory}` : ""}
          </p>
        )}
      </section>

      {/* Future features panel */}
      <section className="paperly-future-panel relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="paperly-ai-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-indigo-600">
            <Brain size={26} />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-indigo-600">
              The next chapter
            </span>

            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-800">
              Your paper is getting smarter
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Your saved interests guide the stories shown here. AI-generated
              summaries, bookmarks, and saved daily editions are planned next
              so you can revisit your newspaper whenever you like.
            </p>

            <a
              href="/onboarding"
              className="paperly-secondary-button mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-indigo-700"
            >
              Personalize your edition
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="paperly-future-decoration hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-violet-500 sm:flex">
            <Sparkles size={28} />
          </div>
        </div>
      </section>

      <footer className="pb-2 text-center text-xs text-slate-400">
        Paperly AI <span className="mx-1.5">·</span>
        Your world, thoughtfully curated.
      </footer>

      {/* Scoped design styles */}
      <style jsx global>{`
        .paperly-neo {
          --paperly-bg: #eef1f9;
          --paperly-shadow: #d0d5e2;
          --paperly-light: #ffffff;
          color: #334155;
        }

        .paperly-hero {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #edf0fa);
          box-shadow:
            14px 14px 32px #d2d7e5,
            -14px -14px 32px #ffffff,
            inset 1px 1px 0 #ffffff;
          animation: paperly-card-in 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .paperly-hero-orb {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(2px);
          animation: paperly-float 12s ease-in-out infinite alternate;
        }

        .paperly-hero-orb-one {
          width: 250px;
          height: 250px;
          right: -50px;
          top: -100px;
          background: radial-gradient(
            circle at 35% 35%,
            rgba(196, 181, 253, 0.6),
            rgba(199, 210, 254, 0.15) 65%,
            transparent 75%
          );
        }

        .paperly-hero-orb-two {
          width: 190px;
          height: 190px;
          right: 18%;
          bottom: -140px;
          background: radial-gradient(
            circle,
            rgba(165, 180, 252, 0.35),
            transparent 70%
          );
          animation-delay: -5s;
        }

        .paperly-hero-pill {
          color: #5b5fc7;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #e9edf9);
          box-shadow:
            4px 4px 9px #d5dae7,
            -4px -4px 9px #ffffff;
        }

        .paperly-gradient-text {
          background: linear-gradient(100deg, #6366f1, #8b5cf6 55%, #4f46e5);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .paperly-interest-pill {
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: linear-gradient(145deg, #f5f6ff, #e7eafd);
          box-shadow:
            3px 3px 7px #d9deeb,
            -3px -3px 7px #ffffff;
          animation: paperly-item-in 450ms ease both;
        }

        .paperly-hero-document {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f6f7ff, #e9edfa);
          box-shadow:
            9px 9px 18px #d2d7e5,
            -9px -9px 18px #ffffff,
            inset 1px 1px 0 #ffffff;
          animation: paperly-float 7s ease-in-out infinite alternate;
        }

        .paperly-document-spark {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          color: #7c3aed;
          background: #eef0ff;
          box-shadow:
            3px 3px 6px #d3d8e6,
            -3px -3px 6px #ffffff;
        }

        .paperly-primary-button {
          background: linear-gradient(110deg, #6366f1, #7c3aed 55%, #4f46e5);
          background-size: 180% 100%;
          box-shadow:
            0 8px 16px rgba(99, 102, 241, 0.22),
            inset 1px 1px 0 rgba(255, 255, 255, 0.35);
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            background-position 400ms ease;
        }

        .paperly-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background-position: 100% 0;
          box-shadow:
            0 12px 22px rgba(99, 102, 241, 0.3),
            inset 1px 1px 0 rgba(255, 255, 255, 0.4);
        }

        .paperly-primary-button:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow:
            inset 3px 3px 7px rgba(49, 46, 129, 0.22),
            inset -2px -2px 5px rgba(255, 255, 255, 0.2);
        }

        .paperly-stat-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff,
            inset 1px 1px 0 rgba(255, 255, 255, 0.9);
          animation: paperly-item-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
          transition:
            transform 280ms ease,
            box-shadow 280ms ease;
        }

        .paperly-stat-card:hover {
          transform: translateY(-4px);
          box-shadow:
            11px 13px 22px #ced4e2,
            -9px -9px 20px #ffffff,
            inset 1px 1px 0 #ffffff;
        }

        .paperly-stat-icon {
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            4px 4px 9px #d6dbe8,
            -4px -4px 9px #ffffff;
          transition: transform 280ms ease;
        }

        .paperly-stat-card:hover .paperly-stat-icon {
          transform: rotate(-7deg) scale(1.06);
        }

        .paperly-stat-indigo {
          color: #6366f1;
          background: linear-gradient(145deg, #eceeff, #dfe4ff);
        }

        .paperly-stat-amber {
          color: #d97706;
          background: linear-gradient(145deg, #fff5dc, #ffebc4);
        }

        .paperly-stat-violet {
          color: #8b5cf6;
          background: linear-gradient(145deg, #f1eaff, #e7ddff);
        }

        .paperly-stat-emerald {
          color: #059669;
          background: linear-gradient(145deg, #e0fff1, #d2f6e7);
        }

        .paperly-heading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.13);
          animation: paperly-pulse 2.5s ease-in-out infinite;
        }

        .paperly-inset {
          border: 1px solid rgba(255, 255, 255, 0.75);
          background: #eef1f9;
          box-shadow:
            inset 3px 3px 7px #d4d9e6,
            inset -3px -3px 7px #ffffff;
        }

        .paperly-filter-bar {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f1f3fb, #e9edf7);
          box-shadow:
            inset 4px 4px 9px #d7dce9,
            inset -4px -4px 9px #ffffff;
          scrollbar-width: thin;
        }

        .paperly-filter-chip {
          transition:
            color 200ms ease,
            background 200ms ease,
            box-shadow 200ms ease,
            transform 200ms ease;
        }

        .paperly-filter-chip:hover {
          transform: translateY(-1px);
        }

        .paperly-filter-active {
          color: #ffffff;
          background: linear-gradient(110deg, #6366f1, #7c3aed);
          box-shadow:
            0 4px 10px rgba(99, 102, 241, 0.25),
            inset 1px 1px 0 rgba(255, 255, 255, 0.3);
        }

        .paperly-news-card {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff,
            inset 1px 1px 0 rgba(255, 255, 255, 0.9);
          animation: paperly-item-in 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
          transition:
            transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 300ms ease,
            border-color 300ms ease;
        }

        .paperly-news-card:hover {
          transform: translateY(-5px);
          border-color: rgba(165, 180, 252, 0.7);
          box-shadow:
            12px 15px 24px #cfd5e3,
            -10px -10px 22px #ffffff,
            inset 1px 1px 0 #ffffff;
        }

        .paperly-category-badge {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #eff0ff, #e4e8ff);
          box-shadow:
            3px 3px 6px #d8ddec,
            -3px -3px 6px #ffffff;
        }

        .paperly-category-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
        }

        .paperly-article-footer {
          border-top: 1px solid rgba(203, 213, 225, 0.5);
        }

        .paperly-source-icon {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f7f8ff, #e9edf9);
          box-shadow:
            3px 3px 7px #d5dae7,
            -3px -3px 7px #ffffff;
        }

        .paperly-read-link {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f0f1ff, #e4e8ff);
          box-shadow:
            3px 3px 7px #d6dbea,
            -3px -3px 7px #ffffff;
          transition:
            transform 200ms ease,
            box-shadow 200ms ease,
            color 200ms ease;
        }

        .paperly-read-link:hover {
          transform: translateY(-1px);
          color: #4f46e5;
          box-shadow:
            4px 5px 9px #d0d6e5,
            -4px -4px 9px #ffffff;
        }

        .paperly-skeleton-card,
        .paperly-message-card {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f7f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff;
        }

        .paperly-skeleton {
          background: linear-gradient(
            100deg,
            #e4e8f2 20%,
            #f8f9ff 45%,
            #e4e8f2 70%
          );
          background-size: 220% 100%;
          animation: paperly-skeleton-shimmer 1.7s ease-in-out infinite;
        }

        .paperly-message-icon,
        .paperly-empty-icon {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f7f8ff, #e9edf9);
          box-shadow:
            6px 6px 12px #d4d9e6,
            -6px -6px 12px #ffffff;
        }

        .paperly-error-icon {
          color: #b91c1c;
        }

        .paperly-secondary-button {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f7f8ff, #e9edf9);
          box-shadow:
            5px 5px 10px #d4d9e6,
            -5px -5px 10px #ffffff;
          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .paperly-secondary-button:hover {
          transform: translateY(-2px);
          box-shadow:
            7px 7px 13px #cfd5e3,
            -6px -6px 12px #ffffff;
        }

        .paperly-secondary-button:active {
          transform: scale(0.98);
          box-shadow:
            inset 3px 3px 6px #d5dae7,
            inset -3px -3px 6px #ffffff;
        }

        .paperly-future-panel {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f5f6ff, #e9ecf8);
          box-shadow:
            10px 10px 22px #d3d8e6,
            -10px -10px 22px #ffffff,
            inset 1px 1px 0 #ffffff;
          animation: paperly-card-in 700ms ease both;
        }

        .paperly-ai-icon,
        .paperly-future-decoration {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f4f5ff, #e4e7fb);
          box-shadow:
            6px 6px 12px #d3d8e6,
            -6px -6px 12px #ffffff;
          transition: transform 250ms ease;
        }

        .paperly-future-panel:hover .paperly-ai-icon {
          transform: rotate(-6deg) scale(1.04);
        }

        .paperly-future-panel:hover .paperly-future-decoration {
          transform: rotate(8deg);
        }

        .paperly-neo button:focus-visible,
        .paperly-neo a:focus-visible {
          outline: 3px solid rgba(99, 102, 241, 0.55);
          outline-offset: 3px;
        }

        @keyframes paperly-card-in {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes paperly-item-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes paperly-float {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(16px, -18px, 0) scale(1.06);
          }
        }

        @keyframes paperly-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.12);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(129, 140, 248, 0.04);
          }
        }

        @keyframes paperly-skeleton-shimmer {
          from {
            background-position: 100% 0;
          }
          to {
            background-position: -120% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-neo *,
          .paperly-neo *::before,
          .paperly-neo *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  accent,
  index,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof BookOpen;
  accent: "indigo" | "amber" | "violet" | "emerald";
  index: number;
}) {
  return (
    <article
      style={{ animationDelay: `${index * 90}ms` }}
      className="paperly-stat-card rounded-[1.5rem] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-800">
            {value}
          </p>
        </div>

        <span
          className={`paperly-stat-icon paperly-stat-${accent} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl`}
        >
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p>

      <div className="paperly-stat-bottom mt-5 h-1 overflow-hidden rounded-full">
        <div
          className={`paperly-stat-bar paperly-stat-bar-${accent} h-full rounded-full`}
        />
      </div>

      <style jsx global>{`
        .paperly-stat-bottom {
          background: #e3e7f1;
          box-shadow:
            inset 2px 2px 4px #d4d9e6,
            inset -2px -2px 4px #ffffff;
        }

        .paperly-stat-bar {
          width: 0;
          animation: paperly-stat-grow 900ms cubic-bezier(0.16, 1, 0.3, 1)
            350ms forwards;
        }

        .paperly-stat-bar-indigo {
          background: linear-gradient(90deg, #818cf8, #6366f1);
        }

        .paperly-stat-bar-amber {
          background: linear-gradient(90deg, #fbbf24, #d97706);
        }

        .paperly-stat-bar-violet {
          background: linear-gradient(90deg, #c4b5fd, #8b5cf6);
        }

        .paperly-stat-bar-emerald {
          background: linear-gradient(90deg, #6ee7b7, #059669);
        }

        @keyframes paperly-stat-grow {
          from {
            width: 0;
          }
          to {
            width: 72%;
          }
        }
      `}</style>
    </article>
  );
}

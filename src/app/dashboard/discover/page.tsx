
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Search,
  Newspaper,
  RefreshCw,
  LoaderCircle,
  Sparkles,
  Clock3,
  AlertCircle,
  X,
} from "lucide-react";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import SaveArticleButton from "@/app/components/dashboard/SaveArticleButton";

type Article = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
  imageUrl?: string | null;
};

type NewsResponse = {
  articles?: Article[];
  count?: number;
  interests?: string[];
  error?: string;
  redirect?: string;
};

const FALLBACK_CATEGORIES = [
  "All",
  "Technology",
  "Business",
  "Health",
  "Sports",
  "Science",
  "World",
];

function isSafeUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Latest story";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Latest story";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ArticleImage({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const showImage = isSafeUrl(article.imageUrl) && !failed;

  return (
    <div
      className={`discover-image relative overflow-hidden ${
        featured ? "aspect-[16/8]" : "aspect-[16/10]"
      }`}
    >
      {showImage ? (
        // RSS image URLs come from external publishers and vary by source.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl!}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-100 via-violet-100 to-slate-100 text-indigo-500">
          <div className="discover-image-icon flex h-14 w-14 items-center justify-center rounded-2xl">
            <Newspaper size={27} />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.15em]">
            {article.category || "Top story"}
          </span>
        </div>
      )}

      <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-indigo-700 shadow-sm backdrop-blur">
        {article.category || "Top story"}
      </span>
    </div>
  );
}

export default function DiscoverPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadNews = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/news", {
        cache: "no-store",
      });

      const data = (await response.json()) as NewsResponse;

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (response.status === 409 && data.redirect) {
        window.location.assign(data.redirect);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load stories.");
      }

      setArticles(data.articles ?? []);
      setInterests(data.interests ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load stories right now."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const categories = useMemo(() => {
    const available = Array.from(
      new Set(articles.map((article) => article.category).filter(Boolean))
    );

    return [
      "All",
      ...new Set([...FALLBACK_CATEGORIES.slice(1), ...available]),
    ];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" ||
        article.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        `${article.title} ${article.summary} ${article.source} ${article.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [articles, selectedCategory, query]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className="paperly-discover min-h-screen text-slate-800">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm lg:hidden"
        />
      )}

      <main className="min-h-screen min-w-0 overflow-x-clip px-4 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="discover-control rounded-xl px-3 py-2.5 text-sm font-bold text-indigo-600 lg:hidden"
              >
                <Compass size={20} />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  <Compass size={15} />
                  Explore your world
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Discover<span className="text-indigo-600">.</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Fresh stories selected around your interests. Explore a
                  topic, find a new perspective, and save what matters.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadNews(true)}
              disabled={loading || refreshing}
              className="discover-control inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-50"
            >
              {refreshing ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
              Refresh stories
            </button>
          </header>

          {/* Interests */}
          {interests.length > 0 && (
            <section className="discover-panel mb-6 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <Sparkles size={17} className="text-indigo-600" />
                Your interests
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="discover-chip rounded-full px-3.5 py-2 text-xs font-bold text-indigo-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Search */}
          <section className="mb-5">
            <label
              htmlFor="discover-search"
              className="sr-only"
            >
              Search stories
            </label>
            <div className="discover-search flex items-center gap-3 rounded-2xl px-4">
              <Search size={20} className="shrink-0 text-slate-400" />
              <input
                id="discover-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search headlines, topics, or sources..."
                className="min-w-0 flex-1 bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="rounded-lg p-1 text-slate-400 hover:text-indigo-600"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </section>

          {/* Category filters */}
          <nav
            aria-label="Filter stories by category"
            className="mb-8 flex gap-2 overflow-x-auto pb-2"
          >
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? "discover-filter-active text-white"
                      : "discover-control text-slate-600 hover:text-indigo-600"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </nav>

          {/* Loading */}
          {loading && (
            <div className="discover-panel flex min-h-[300px] flex-col items-center justify-center rounded-[28px] p-8 text-center">
              <LoaderCircle
                size={34}
                className="animate-spin text-indigo-600"
              />
              <h2 className="mt-5 text-lg font-extrabold">
                Discovering fresh stories
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Gathering the latest news for you...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="discover-panel rounded-[28px] p-8 text-center"
            >
              <AlertCircle size={32} className="mx-auto text-red-500" />
              <h2 className="mt-4 text-xl font-extrabold">
                Stories couldn't load
              </h2>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={() => void loadNews()}
                className="discover-filter-active mt-5 rounded-xl px-5 py-3 text-sm font-bold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* Story feed */}
          {!loading && !error && filteredArticles.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">
                    {selectedCategory === "All"
                      ? "Stories for you"
                      : selectedCategory}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredArticles.length}{" "}
                    {filteredArticles.length === 1 ? "story" : "stories"} found
                  </p>
                </div>
                {query && (
                  <span className="text-xs text-slate-500">
                    Search: “{query}”
                  </span>
                )}
              </div>

              {/* Featured story */}
              {featuredArticle && (
                <article className="discover-panel mb-7 grid min-w-0 overflow-hidden rounded-[28px] lg:grid-cols-[1.1fr_0.9fr]">
                  <ArticleImage article={featuredArticle} featured />

                  <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-9">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                      <Sparkles size={15} />
                      Featured story
                    </div>

                    <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
                      {featuredArticle.title}
                    </h2>

                    <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-500">
                      {featuredArticle.summary ||
                        "Read the original report for more details."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-600">
                        {featuredArticle.source}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {formatDate(featuredArticle.publishedAt)}
                      </span>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                      {isSafeUrl(featuredArticle.url) && (
                        <a
                          href={featuredArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="discover-filter-active inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
                        >
                          Read original
                          <ArrowUpRight size={16} />
                        </a>
                      )}
                      <SaveArticleButton article={featuredArticle} />
                    </div>
                  </div>
                </article>
              )}

              {/* Remaining stories */}
              {remainingArticles.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {remainingArticles.map((article, index) => (
                    <article
                      key={`${article.url}-${index}`}
                      className="discover-card flex min-w-0 flex-col overflow-hidden rounded-[24px]"
                    >
                      <ArticleImage article={article} />

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                          <span className="truncate font-bold text-slate-600">
                            {article.source}
                          </span>
                          <span className="shrink-0">
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-800">
                          {article.title}
                        </h3>

                        <p className="mt-3 line-clamp-4 flex-1 text-sm leading-7 text-slate-500">
                          {article.summary ||
                            "Open the original report for the complete story."}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-4">
                          {isSafeUrl(article.url) && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              Read story
                              <ArrowUpRight size={15} />
                            </a>
                          )}
                          <div className="ml-auto">
                            <SaveArticleButton article={article} />
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty */}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="discover-panel rounded-[28px] px-6 py-16 text-center">
              <div className="discover-image-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-indigo-600">
                <Search size={27} />
              </div>
              <h2 className="mt-5 text-xl font-extrabold">
                No matching stories
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try another search or choose a different topic.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                }}
                className="discover-control mt-5 rounded-xl px-4 py-3 text-sm font-bold text-indigo-600"
              >
                Clear filters
              </button>
            </div>
          )}

          <footer className="py-10 text-center text-xs text-slate-400">
            <Link
              href="/dashboard/edition"
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Read your saved daily edition
            </Link>
            <p className="mt-2">
              Paperly AI · Explore stories. Follow the original sources.
            </p>
          </footer>
        </div>
      </main>

      <style jsx global>{`
        .paperly-discover {
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(196, 181, 253, 0.16),
              transparent 32%
            ),
            #eef1f9;
        }

        .discover-panel,
        .discover-card {
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: linear-gradient(145deg, #f8f9ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff;
        }

        .discover-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .discover-card:hover {
          transform: translateY(-3px);
          box-shadow:
            11px 12px 22px #cfd5e3,
            -9px -9px 20px #ffffff;
        }

        .discover-control,
        .discover-search {
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: linear-gradient(145deg, #f7f8ff, #e9edf8);
          box-shadow:
            4px 4px 9px #d4d9e6,
            -4px -4px 9px #ffffff;
        }

        .discover-search:focus-within {
          outline: 2px solid rgba(99, 102, 241, 0.35);
          outline-offset: 2px;
        }

        .discover-chip {
          background: linear-gradient(145deg, #eeedff, #e4e6ff);
        }

        .discover-filter-active {
          background: linear-gradient(110deg, #6366f1, #7c3aed);
          box-shadow: 0 6px 13px rgba(99, 102, 241, 0.22);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .discover-filter-active:hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 18px rgba(99, 102, 241, 0.28);
        }

        .discover-image {
          background: #e8eafa;
        }

        .discover-image-icon {
          background: linear-gradient(145deg, #f7f8ff, #e7eaff);
          box-shadow:
            5px 5px 10px #d4d9e6,
            -5px -5px 10px #ffffff;
        }

        @media (prefers-reduced-motion: reduce) {
          .discover-card,
          .discover-filter-active {
            transition: none !important;
          }

          .discover-card:hover,
          .discover-filter-active:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

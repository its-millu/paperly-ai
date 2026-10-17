
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  ExternalLink,
  History,
  LoaderCircle,
  Menu,
  Search,
  Trash2,
} from "lucide-react";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

type HistoryArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
  firstReadAt: string;
  lastReadAt: string;
  readCount: number;
};

const panel =
  "rounded-[24px] border border-white/80 bg-[#eef1f9] shadow-[8px_8px_18px_#d2d7e4,-8px_-8px_18px_#ffffff]";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function relativeDate(value: string) {
  const date = new Date(value);
  const time = date.getTime();

  if (Number.isNaN(time)) return "Date unavailable";

  const days = Math.floor(
    (new Date().setHours(0, 0, 0, 0) -
      new Date(time).setHours(0, 0, 0, 0)) /
      86_400_000,
  );

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

export default function ReadingHistoryPage() {
  const [articles, setArticles] = useState<HistoryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reading-history", {
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load reading history.");
      }

      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reading history.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadHistory(controller.signal);

    return () => controller.abort();
  }, [loadHistory]);

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set(articles.map((item) => item.category))).sort(),
    ],
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        category === "All categories" || article.category === category;

      const matchesSearch =
        !search ||
        [
          article.title,
          article.summary,
          article.source,
          article.category,
        ].some((value) => value.toLowerCase().includes(search));

      return matchesCategory && matchesSearch;
    });
  }, [articles, category, query]);

  const totalOpens = articles.reduce(
    (total, article) => total + article.readCount,
    0,
  );

  const todayCount = articles.filter((article) => {
    const date = new Date(article.lastReadAt);
    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  async function removeArticle(url: string) {
    if (deletingUrl) return;

    setDeletingUrl(url);
    setError("");

    try {
      const response = await fetch("/api/reading-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove history item.");
      }

      setArticles((current) =>
        current.filter((article) => article.url !== url),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove history item.",
      );
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef1f9] text-slate-800">
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

      <main className="min-h-screen min-w-0 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-7">
          <header className={`${panel} p-5 sm:p-8`}>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-indigo-600 shadow-[4px_4px_9px_#d2d7e4,-4px_-4px_9px_#ffffff] lg:hidden`}
              >
                <Menu size={21} />
              </button>

              <Link
                href="/dashboard"
                className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft size={16} />
                Dashboard
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-indigo-600 sm:flex ${panel}`}>
                <History size={26} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Your reading journey
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Reading History
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Revisit stories you have opened, explore your reading
                  patterns, and pick up where curiosity left off.
                </p>
              </div>
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-3 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Articles read",
                value: articles.length,
                description: "Unique stories in your history",
                Icon: BookOpen,
              },
              {
                label: "Total opens",
                value: totalOpens,
                description: "Including revisits",
                Icon: History,
              },
              {
                label: "Read today",
                value: todayCount,
                description: "Unique stories opened today",
                Icon: Clock3,
              },
            ].map(({ label, value, description, Icon }) => (
              <div key={label} className={`${panel} p-5`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    {label}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-indigo-600 shadow-[4px_4px_9px_#d2d7e4,-4px_-4px_9px_#ffffff]">
                    <Icon size={20} />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-black tabular-nums">
                  {loading ? "—" : value}
                </p>
                <p className="mt-2 text-xs text-slate-400">{description}</p>
              </div>
            ))}
          </section>

          <section className={`${panel} p-4 sm:p-6`}>
            <div className="flex flex-col gap-4 md:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search reading history</span>
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles, sources, or topics..."
                  className="w-full rounded-2xl border border-white/70 bg-[#eef1f9] py-3.5 pl-11 pr-4 text-sm outline-none shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60"
                />
              </label>

              <label className="min-w-0 md:w-56">
                <span className="sr-only">Filter by category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-[#eef1f9] px-4 py-3.5 text-sm outline-none shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-300"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Recently read</h2>
              <span className="text-sm text-slate-500">
                {loading ? "Loading..." : `${filteredArticles.length} articles`}
              </span>
            </div>

            {loading ? (
              <div className={`${panel} flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500`}>
                <LoaderCircle size={21} className="animate-spin text-indigo-500" />
                Loading your reading history...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className={`${panel} px-5 py-14 text-center sm:px-10`}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-indigo-600 shadow-[inset_5px_5px_10px_#d2d7e4,inset_-5px_-5px_10px_#ffffff]">
                  <BookOpen size={27} />
                </div>
                <h3 className="mt-5 text-lg font-extrabold">
                  {articles.length === 0
                    ? "Your reading journey starts here"
                    : "No matching articles"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {articles.length === 0
                    ? "Open a story from Discover or your Daily Edition. Once article tracking is connected, it will appear here."
                    : "Try another search or choose a different category."}
                </p>
                {articles.length === 0 && (
                  <Link
                    href="/dashboard/discover"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[5px_5px_12px_#d2d7e4,-4px_-4px_10px_#ffffff]"
                  >
                    Discover stories
                    <ExternalLink size={16} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <article key={article.url} className={`${panel} p-5 sm:p-6`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-indigo-600 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                        <BookOpen size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-[3px_3px_6px_#d2d7e4,-3px_-3px_6px_#ffffff]">
                            {article.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {article.source}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-extrabold leading-snug text-slate-800">
                          {article.title}
                        </h3>

                        {article.summary && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                            {article.summary}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                          <span>
                            Last read: {relativeDate(article.lastReadAt)}
                          </span>
                          <span>{article.readCount} opens</span>
                          <span title={formatDate(article.firstReadAt)}>
                            First read: {formatDate(article.firstReadAt)}
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_9px_#d2d7e4,-4px_-4px_9px_#ffffff] transition hover:-translate-y-0.5"
                          >
                            Read again
                            <ExternalLink size={15} />
                          </a>

                          <button
                            type="button"
                            onClick={() => void removeArticle(article.url)}
                            disabled={deletingUrl !== null}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-[4px_4px_9px_#d2d7e4,-4px_-4px_9px_#ffffff] transition hover:text-red-600 active:shadow-inner disabled:opacity-50"
                          >
                            {deletingUrl === article.url ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="pb-3 text-center text-xs text-slate-400">
            Paperly AI · A little more informed every day.
          </footer>
        </div>
      </main>
    </div>
  );
}

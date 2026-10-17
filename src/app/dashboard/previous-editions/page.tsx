
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  History,
  LoaderCircle,
  Menu,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

type EditionSummary = {
  _id: string;
  editionDate: string;
  title: string;
  interests: string[];
  articleCount: number;
  generatedAt: string;
};

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

type Edition = {
  _id: string;
  editionDate: string;
  title: string;
  interests: string[];
  articles: Article[];
  generatedAt: string;
};

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatDate(value: string, includeWeekday = true) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: includeWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export default function PreviousEditionsPage() {
  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [selectedEdition, setSelectedEdition] =
    useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingDate, setOpeningDate] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadEditions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/editions/history", {
        cache: "no-store",
      });

      const data = (await response.json()) as {
        editions?: EditionSummary[];
        error?: string;
      };

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load previous editions.",
        );
      }

      setEditions(data.editions ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading the archive.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEditions();
  }, [loadEditions]);

  const openEdition = async (date: string) => {
    setOpeningDate(date);
    setError("");

    try {
      const response = await fetch(
        `/api/editions/history/${encodeURIComponent(date)}`,
        { cache: "no-store" },
      );

      const data = (await response.json()) as {
        edition?: Edition;
        error?: string;
      };

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok || !data.edition) {
        throw new Error(
          data.error || "Unable to open this edition.",
        );
      }

      setSelectedEdition(data.edition);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open this edition.",
      );
    } finally {
      setOpeningDate("");
    }
  };

  const filteredEditions = editions.filter((edition) => {
    const searchable =
      `${edition.editionDate} ${edition.title} ${(edition.interests ?? []).join(" ")}`;

    return searchable.toLowerCase().includes(
      query.toLowerCase().trim(),
    );
  });

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

      <main className="min-h-screen min-w-0 px-4 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef1f9] text-indigo-600 shadow-[6px_6px_14px_#d1d5e0,-6px_-6px_14px_#ffffff] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <Link
                  href="/dashboard"
                  className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
                >
                  <ArrowLeft size={16} />
                  Dashboard
                </Link>

                <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1f9] text-indigo-600 shadow-[6px_6px_14px_#d1d5e0,-6px_-6px_14px_#ffffff]">
                    <History size={22} />
                  </span>
                  Previous Day Editions
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Revisit your saved daily papers, exactly as they
                  were generated.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadEditions()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#eef1f9] px-4 py-3 text-sm font-bold text-indigo-600 shadow-[5px_5px_12px_#d1d5e0,-5px_-5px_12px_#ffffff] transition hover:text-indigo-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              {error}
            </div>
          )}

          {selectedEdition ? (
            <section className="mb-8 rounded-3xl bg-[#eef1f9] p-5 shadow-[8px_8px_20px_#d1d5e0,-8px_-8px_20px_#ffffff] sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-500">
                    Archived daily paper
                  </p>

                  <h2 className="text-2xl font-black">
                    {selectedEdition.title}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} />
                    {formatDate(selectedEdition.editionDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEdition(null)}
                  className="rounded-xl bg-[#eef1f9] px-4 py-2.5 text-sm font-bold text-slate-600 shadow-[4px_4px_9px_#d1d5e0,-4px_-4px_9px_#ffffff] transition hover:text-indigo-600"
                >
                  Back to archive
                </button>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {(selectedEdition.interests ?? []).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-[#eef1f9] px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-[inset_2px_2px_5px_#d1d5e0,inset_-2px_-2px_5px_#ffffff]"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500">
                <BookOpen size={17} />
                {selectedEdition.articles.length} stories in this edition
              </div>

              <div className="space-y-4">
                {selectedEdition.articles.map((article, index) => (
                  <article
                    key={`${article.url}-${index}`}
                    className="rounded-2xl bg-[#eef1f9] p-4 shadow-[5px_5px_12px_#d1d5e0,-5px_-5px_12px_#ffffff] sm:p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">
                        {article.category || "Top Stories"}
                      </span>
                      <span className="text-slate-400">
                        {article.source}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold leading-6 sm:text-lg">
                      {article.title}
                    </h3>

                    {article.summary && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {article.summary}
                      </p>
                    )}

                    {isSafeUrl(article.url) && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-indigo-600 transition hover:text-indigo-800"
                      >
                        Read original story
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-3xl bg-[#eef1f9] p-5 shadow-[8px_8px_20px_#d1d5e0,-8px_-8px_20px_#ffffff] sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold">
                    Your archive
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editions.length} saved{" "}
                    {editions.length === 1 ? "edition" : "editions"}
                  </p>
                </div>

                <label className="flex min-w-[220px] items-center gap-2 rounded-2xl bg-[#eef1f9] px-4 py-3 text-slate-500 shadow-[inset_4px_4px_8px_#d1d5e0,inset_-4px_-4px_8px_#ffffff]">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by date or interest"
                    className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              {loading ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-indigo-500"
                  />
                  <p className="text-sm font-semibold">
                    Loading your archive…
                  </p>
                </div>
              ) : filteredEditions.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef1f9] text-indigo-500 shadow-[inset_5px_5px_10px_#d1d5e0,inset_-5px_-5px_10px_#ffffff]">
                    <Newspaper size={27} />
                  </span>

                  <h3 className="text-lg font-extrabold">
                    {query
                      ? "No matching editions"
                      : "No previous editions yet"}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {query
                      ? "Try a different date or interest."
                      : "When Paperly AI has saved daily editions on earlier dates, they will appear here. Your current edition is available from Daily Editions."}
                  </p>

                  {!query && (
                    <Link
                      href="/dashboard/edition"
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#eef1f9] px-4 py-3 text-sm font-extrabold text-indigo-600 shadow-[5px_5px_12px_#d1d5e0,-5px_-5px_12px_#ffffff]"
                    >
                      <FileText size={16} />
                      Open Daily Editions
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredEditions.map((edition) => (
                    <article
                      key={edition._id}
                      className="rounded-2xl bg-[#eef1f9] p-5 shadow-[5px_5px_12px_#d1d5e0,-5px_-5px_12px_#ffffff] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef1f9] text-indigo-600 shadow-[inset_3px_3px_6px_#d1d5e0,inset_-3px_-3px_6px_#ffffff]">
                          <Newspaper size={20} />
                        </span>

                        <span className="rounded-full bg-[#eef1f9] px-3 py-1.5 text-xs font-extrabold text-slate-500 shadow-[inset_2px_2px_4px_#d1d5e0,inset_-2px_-2px_4px_#ffffff]">
                          {edition.articleCount} stories
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold">
                        {edition.title}
                      </h3>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-indigo-500"
                        />
                        {formatDate(edition.editionDate)}
                      </p>

                      {edition.interests?.length > 0 && (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                          Interests: {edition.interests.join(" · ")}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void openEdition(edition.editionDate)
                        }
                        disabled={openingDate === edition.editionDate}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#eef1f9] px-4 py-3 text-sm font-extrabold text-indigo-600 shadow-[5px_5px_10px_#d1d5e0,-5px_-5px_10px_#ffffff] transition hover:text-indigo-800 disabled:opacity-50"
                      >
                        {openingDate === edition.editionDate ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <BookOpen size={17} />
                        )}

                        {openingDate === edition.editionDate
                          ? "Opening…"
                          : "Read this edition"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          <footer className="mt-6 flex items-center justify-center gap-2 pb-4 text-xs font-medium text-slate-400">
            <Clock3 size={14} />
            Editions are archived by Pakistan calendar date.
          </footer>
        </div>
      </main>
    </div>
  );
}

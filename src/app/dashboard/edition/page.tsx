
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Menu,
  Newspaper,
  Printer,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

type Briefing = {
  headline: string;
  introduction: string;
  keyThemes: string[];
  summaries: Array<{
    title: string;
    summary: string;
  }>;
  provider?: string;
  model?: string;
  generatedAt?: string;
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
  briefing?: Briefing | null;
};

type EditionResponse = {
  edition?: Edition;
  isNew?: boolean;
  error?: string;
  redirect?: string;
};

function isSafeUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatEditionDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatArticleDate(value: string | null) {
  if (!value) return "Latest coverage";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Latest coverage";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function EditorialImage({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageUrl = isSafeUrl(article.imageUrl) && !failed
    ? article.imageUrl
    : null;

  return (
    <div
      className={`edition-image overflow-hidden rounded-2xl ${
        featured ? "aspect-[16/8] sm:aspect-[16/7]" : "aspect-[16/9]"
      }`}
    >
      {imageUrl ? (
        // External publishers supply these image URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          loading={featured ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-100 via-violet-100 to-slate-100 text-indigo-500">
          <Newspaper size={30} />
          <span className="text-xs font-bold uppercase tracking-[0.15em]">
            {article.category || "Daily news"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function DailyEditionPage() {
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skippedArticleUrls, setSkippedArticleUrls] = useState<string[]>([]);
  const [hydratedEditionId, setHydratedEditionId] = useState<string | null>(null);

  // Store dismissals per edition so skipping today's story doesn't hide it in a future edition.
  useEffect(() => {
    if (!edition) return;

    try {
      const stored = window.localStorage.getItem(
        `paperly:skipped-edition-articles:${edition._id}`,
      );
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        setSkippedArticleUrls(
          Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === "string")
            : [],
        );
      } else {
        setSkippedArticleUrls([]);
      }
    } catch {
      // Storage may be disabled; skipping still works for the current session.
      setSkippedArticleUrls([]);
    } finally {
      setHydratedEditionId(edition._id);
    }
  }, [edition]);

  useEffect(() => {
    if (!edition || hydratedEditionId !== edition._id) return;

    try {
      window.localStorage.setItem(
        `paperly:skipped-edition-articles:${edition._id}`,
        JSON.stringify(skippedArticleUrls),
      );
    } catch {
      // Ignore storage quota/privacy errors; in-memory state remains functional.
    }
  }, [edition, hydratedEditionId, skippedArticleUrls]);

  const skipArticle = useCallback((url: string) => {
    setSkippedArticleUrls((current) =>
      current.includes(url) ? current : [...current, url],
    );
  }, []);

  const loadEdition = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/editions/today", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as EditionResponse;

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (response.status === 409 && data.redirect) {
        window.location.assign(data.redirect);
        return;
      }

      if (!response.ok || !data.edition) {
        throw new Error(data.error || "Unable to load your daily edition.");
      }

      setEdition(data.edition);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your paper.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEdition();
  }, [loadEdition]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const visibleArticles = useMemo(
    () => edition?.articles.filter((article) => !skippedArticleUrls.includes(article.url)) ?? [],
    [edition, skippedArticleUrls],
  );

  const sections = useMemo(() => {
    if (!edition) return [];

    const grouped = new Map<string, Article[]>();

    // The first visible article is presented separately as the editor's lead.
    // Exclude it from section lists so it isn't repeated below.
    for (const article of visibleArticles.slice(1)) {
      const category = article.category || "Top Stories";
      const items = grouped.get(category) ?? [];
      items.push(article);
      grouped.set(category, items);
    }

    return Array.from(grouped.entries());
  }, [edition, visibleArticles]);

  const leadArticle = visibleArticles[0];

  return (
    <div className="paperly-reader min-h-screen bg-[#eef1f9] text-slate-800">
      <div className="no-print">
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
      </div>

      <main className="reader-main min-h-screen min-w-0 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className="reader-icon flex h-11 w-11 items-center justify-center rounded-xl text-indigo-600 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600"
              >
                <ArrowLeft size={17} />
                Dashboard
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!edition || loading || Boolean(error)}
                className="reader-primary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Printer size={16} />
                Download PDF
              </button>

              <button
                type="button"
                onClick={() => void loadEdition(true)}
                disabled={loading || refreshing}
                className="reader-icon inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 disabled:opacity-50 sm:px-4"
              >
                {refreshing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>Reload edition</span>
              </button>
            </div>
          </header>

          {loading && (
            <section className="reader-panel flex min-h-[360px] flex-col items-center justify-center rounded-[28px] p-8 text-center">
              <LoaderCircle size={30} className="animate-spin text-indigo-600" />
              <h1 className="mt-5 text-xl font-extrabold">
                Preparing your newspaper
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Opening your saved daily edition...
              </p>
            </section>
          )}

          {!loading && error && (
            <section
              role="alert"
              className="reader-panel rounded-[28px] p-8 text-center sm:p-12"
            >
              <Newspaper size={30} className="mx-auto text-red-500" />
              <h1 className="mt-5 text-2xl font-black">
                Your paper couldn&apos;t load
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadEdition()}
                className="reader-primary mt-6 rounded-xl px-5 py-3 text-sm font-bold text-white"
              >
                Try again
              </button>
            </section>
          )}

          {!loading && !error && edition && (
            <article id="daily-newspaper" className="newspaper-document">
              <section className="reader-panel newspaper-masthead overflow-hidden rounded-[28px]">
                <div className="border-b border-indigo-100/80 px-5 py-4 sm:px-9">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                      <Sparkles size={15} />
                      Your world. Your daily paper.
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Saved edition
                    </div>
                  </div>
                </div>

                <div className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Paperly AI · Daily Edition
                  </p>

                  <h1 className="mt-3 font-serif text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                    {edition.title || "Your Daily Paper"}
                    <span className="text-indigo-600">.</span>
                  </h1>

                  <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} className="text-indigo-500" />
                    {formatEditionDate(edition.editionDate)}
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-5 sm:max-w-sm">
                    <div className="reader-inset rounded-2xl p-4">
                      <p className="text-xs font-medium text-slate-500">Stories</p>
                      <p className="mt-1 text-3xl font-black text-slate-800">
                        {visibleArticles.length}
                      </p>
                    </div>
                    <div className="reader-inset rounded-2xl p-4">
                      <p className="text-xs font-medium text-slate-500">Sections</p>
                      <p className="mt-1 text-3xl font-black text-slate-800">
                        {sections.length}
                      </p>
                    </div>
                  </div>

                  {edition.interests.length > 0 && (
                    <div className="mt-7 border-t border-slate-200/80 pt-5">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Curated around your interests
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {edition.interests.map((interest) => (
                          <span
                            key={interest}
                            className="reader-chip rounded-full px-3.5 py-2 text-xs font-bold text-indigo-700"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {leadArticle && (
                <section className="reader-lead mt-6 rounded-[28px] p-5 sm:p-9 lg:p-11">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                      <Sparkles size={15} />
                      Editor&apos;s lead
                    </div>
                    <button
                      type="button"
                      onClick={() => skipArticle(leadArticle.url)}
                      aria-label={`Skip story: ${leadArticle.title}`}
                      className="no-print reader-skip inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                    >
                      <Trash2 size={15} />
                      Skip story
                    </button>
                  </div>

                  <EditorialImage article={leadArticle} featured />

                  <span className="mt-6 inline-flex rounded-full bg-indigo-100/80 px-3 py-1.5 text-xs font-bold text-indigo-700">
                    {leadArticle.category}
                  </span>

                  <h2 className="mt-4 max-w-4xl font-serif text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    {leadArticle.title}
                  </h2>

                  {leadArticle.summary && (
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                      {leadArticle.summary}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <BookOpen size={15} className="text-indigo-500" />
                      {leadArticle.source}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={15} />
                      {formatArticleDate(leadArticle.publishedAt)}
                    </span>
                  </div>

                  {isSafeUrl(leadArticle.url) && (
                    <a
                      href={leadArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print reader-primary mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                    >
                      Read full story
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </section>
              )}

              <div className="newspaper-sections mt-10 space-y-10">
                {sections.map(([category, articles]) => (
                  <section key={category} className="newspaper-section">
                    <div className="mb-5 flex items-center gap-3 border-b-2 border-indigo-200 pb-3">
                      <div className="h-7 w-1.5 rounded-full bg-indigo-500" />
                      <h2 className="font-serif text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                        {category}
                      </h2>
                      <span className="reader-count rounded-full px-2.5 py-1 text-xs font-bold text-slate-500">
                        {articles.length}
                      </span>
                    </div>

                    <div className="newspaper-article-list grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {articles.map((article, index) => (
                        <section
                          key={`${article.url}-${index}`}
                          className="reader-article flex min-w-0 flex-col rounded-[22px] p-5 sm:p-6"
                        >
                          <EditorialImage article={article} />

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="reader-category rounded-full px-3 py-1.5 text-[11px] font-bold text-indigo-700">
                              {article.category}
                            </span>
                            <div className="no-print flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-400">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <button
                                type="button"
                                onClick={() => skipArticle(article.url)}
                                aria-label={`Skip story: ${article.title}`}
                                title="Skip this story"
                                className="reader-skip inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                              >
                                <Trash2 size={14} />
                                <span>Skip</span>
                              </button>
                            </div>
                          </div>

                          <h3 className="mt-4 font-serif text-xl font-bold leading-snug text-slate-900">
                            {article.title}
                          </h3>

                          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                            {article.summary ||
                              "A brief report. Consult the original publisher for additional details."}
                          </p>

                          <div className="mt-5 border-t border-slate-200/80 pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                              <span className="font-bold">{article.source}</span>
                              <span>{formatArticleDate(article.publishedAt)}</span>
                            </div>

                            {isSafeUrl(article.url) && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-print reader-story-link mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                              >
                                Read original story
                                <ArrowUpRight size={15} />
                              </a>
                            )}

                            <p className="print-source mt-3 hidden break-all text-xs text-slate-600">
                              Source: {article.source}
                              {isSafeUrl(article.url) ? ` · ${article.url}` : ""}
                            </p>
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="reader-panel mt-10 rounded-[24px] px-5 py-7 text-center sm:px-8">
                <div className="reader-icon mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-indigo-600">
                  <Newspaper size={22} />
                </div>
                <h2 className="mt-4 font-serif text-xl font-extrabold text-slate-800">
                  End of today&apos;s edition
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  A personalized briefing prepared around your interests.
                  Summaries are provided for quick reading; original publishers
                  remain the source for complete reporting.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-[11px] text-slate-400">
                  <FileText size={13} />
                  Paperly AI · A personalized daily briefing
                </p>
              </footer>
            </article>
          )}
        </div>
      </main>

      <style jsx global>{`
        .paperly-reader {
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(196, 181, 253, 0.15),
              transparent 30%
            ),
            #eef1f9;
        }

        .reader-panel,
        .reader-article,
        .reader-lead {
          border: 1px solid rgba(255, 255, 255, 0.92);
          background: linear-gradient(145deg, #f8f9ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff;
        }

        .reader-lead {
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(196, 181, 253, 0.2),
              transparent 45%
            ),
            linear-gradient(145deg, #f8f9ff, #edf0f9);
        }

        .reader-article {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .reader-article:hover {
          transform: translateY(-3px);
          box-shadow:
            11px 12px 22px #cfd5e3,
            -9px -9px 20px #ffffff;
        }

        .reader-icon,
        .reader-secondary {
          border: 1px solid rgba(255, 255, 255, 0.92);
          background: linear-gradient(145deg, #f7f8ff, #e9edf8);
          box-shadow:
            4px 4px 9px #d4d9e6,
            -4px -4px 9px #ffffff;
        }

        .reader-inset {
          background: #eef1f9;
          box-shadow:
            inset 3px 3px 6px #d4d9e6,
            inset -3px -3px 6px #ffffff;
        }

        .reader-chip,
        .reader-category {
          background: linear-gradient(145deg, #eeedff, #e4e6ff);
        }

        .reader-count {
          background: #eef1f9;
          box-shadow:
            inset 2px 2px 4px #d4d9e6,
            inset -2px -2px 4px #ffffff;
        }

        .reader-primary {
          background: linear-gradient(110deg, #6366f1, #7c3aed);
          box-shadow: 0 6px 13px rgba(99, 102, 241, 0.2);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .reader-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 9px 18px rgba(99, 102, 241, 0.3);
        }

        .reader-story-link {
          text-decoration: none;
        }

        .reader-skip {
          border: 1px solid rgba(244, 63, 94, 0.16);
          background: linear-gradient(145deg, #fff7f8, #ffeef1);
          box-shadow: 3px 3px 7px #e1d5dc, -3px -3px 7px #ffffff;
        }

        .reader-skip:hover {
          background: #fff0f2;
        }

        .edition-image {
          background: #e8eafa;
          break-inside: avoid;
        }

        .print-source {
          overflow-wrap: anywhere;
        }

        @media (prefers-reduced-motion: reduce) {
          .reader-article,
          .reader-primary {
            transition: none !important;
          }

          .reader-article:hover,
          .reader-primary:hover {
            transform: none !important;
          }
        }

        @page {
          size: A4;
          margin: 10mm 11mm 12mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #172033 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          .no-print,
          .paperly-reader .no-print,
          aside,
          nav {
            display: none !important;
          }

          .paperly-reader,
          .reader-main {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          .reader-main > div {
            width: 100% !important;
            max-width: none !important;
          }

          .newspaper-document {
            width: 100% !important;
            color: #172033 !important;
            font-family: Georgia, "Times New Roman", serif !important;
          }

          .reader-panel,
          .reader-article,
          .reader-lead {
            color: #172033 !important;
            background: #ffffff !important;
            border: 1px solid #d9deea !important;
            border-radius: 5px !important;
            box-shadow: none !important;
          }

          .newspaper-masthead {
            margin: 0 0 7mm !important;
            break-after: avoid;
          }

          .newspaper-masthead > div:first-child {
            padding: 3mm 5mm !important;
          }

          .newspaper-masthead > div:last-child {
            padding: 6mm 5mm !important;
          }

          .newspaper-masthead h1 {
            font-size: 30pt !important;
            line-height: 1.02 !important;
          }

          .newspaper-masthead .reader-inset {
            padding: 2mm 3mm !important;
            box-shadow: none !important;
            border: 1px solid #e1e5ef !important;
          }

          .newspaper-masthead .reader-inset p:last-child {
            font-size: 17pt !important;
          }

          .newspaper-masthead .reader-chip {
            padding: 1.5mm 3mm !important;
          }

          .reader-lead {
            margin: 0 0 7mm !important;
            padding: 5mm !important;
            break-inside: avoid;
          }

          .reader-lead .edition-image {
            height: 48mm !important;
            aspect-ratio: auto !important;
            margin: 0 0 4mm !important;
          }

          .reader-lead h2 {
            margin-top: 2mm !important;
            font-size: 22pt !important;
            line-height: 1.12 !important;
          }

          .reader-lead p {
            margin-top: 2mm !important;
            font-size: 9.5pt !important;
            line-height: 1.45 !important;
          }

          .newspaper-sections {
            margin-top: 5mm !important;
          }

          .newspaper-section {
            margin-top: 5mm !important;
            break-inside: auto;
          }

          .newspaper-section > div:first-child {
            margin-bottom: 3mm !important;
            padding-bottom: 2mm !important;
            break-after: avoid;
          }

          .newspaper-section > div:first-child h2 {
            font-size: 17pt !important;
          }

          .newspaper-article-list {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 4mm !important;
            align-items: start !important;
          }

          .reader-article {
            display: flex !important;
            flex-direction: column !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 3mm !important;
            border: 1px solid #d9deea !important;
            border-radius: 4px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .reader-article .edition-image {
            width: 100% !important;
            height: 29mm !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
            border-radius: 2px !important;
            background: #f0f2f8 !important;
          }

          .edition-image img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            max-height: none !important;
            object-fit: cover !important;
          }

          .reader-article h3 {
            margin-top: 2mm !important;
            font-size: 11pt !important;
            line-height: 1.2 !important;
            color: #172033 !important;
          }

          .reader-article p {
            margin-top: 1.5mm !important;
            font-size: 8pt !important;
            line-height: 1.35 !important;
            color: #3f485a !important;
          }

          .reader-article > div:last-child {
            margin-top: 2mm !important;
            padding-top: 2mm !important;
          }

          .reader-article > div:last-child > div {
            font-size: 7pt !important;
          }

          .reader-article .reader-category {
            padding: 1mm 2mm !important;
            font-size: 7pt !important;
          }

          .reader-primary,
          .reader-icon,
          .reader-count,
          .reader-chip,
          .reader-category {
            box-shadow: none !important;
          }

          .print-source {
            display: block !important;
            margin-top: 1.5mm !important;
            font-size: 6.5pt !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere !important;
          }

          a {
            color: #273c8f !important;
            text-decoration: none !important;
          }

          footer {
            margin-top: 6mm !important;
            padding: 4mm !important;
            break-inside: avoid;
          }

          footer .reader-icon {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
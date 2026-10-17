
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  FileText,
  LoaderCircle,
  Menu,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

type SavedArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
  savedAt: string;
};

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatSavedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function SavedArticlesPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const [confirmArticle, setConfirmArticle] = useState<SavedArticle | null>(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadArticles = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/saved-articles", {
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to load saved articles."
        );
      }

      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load saved articles."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadArticles(controller.signal);

    return () => controller.abort();
  }, [loadArticles]);

  useEffect(() => {
    if (!confirmArticle && !sidebarOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (confirmArticle && !removingUrl) {
          setConfirmArticle(null);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmArticle, sidebarOpen, removingUrl]);

  async function removeArticle(url: string) {
    setRemovingUrl(url);
    setError("");

    try {
      const response = await fetch("/api/saved-articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to remove article."
        );
      }

      setArticles((current) => current.filter((item) => item.url !== url));
      setConfirmArticle(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove article."
      );
    } finally {
      setRemovingUrl(null);
    }
  }

  return (
    <div className="paperly-saved-layout min-h-screen bg-[#eef1f9]">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <main className="min-h-screen min-w-0 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto w-full max-w-[1600px] space-y-7">
          <header className="paperly-saved-panel rounded-[28px] p-5 sm:p-8 lg:p-9">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                className="paperly-saved-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-indigo-600 transition hover:text-indigo-800 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <Link
                href="/dashboard"
                className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
              >
                <ArrowLeft size={16} />
                <span>Back to your paper</span>
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="paperly-saved-icon hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-indigo-600 sm:flex">
                <Bookmark size={26} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.17em] text-indigo-600">
                  Your personal library
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                  Saved Articles
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                  Keep important stories close and return to them whenever you
                  need.
                </p>
              </div>
            </div>

            <div className="paperly-saved-count mt-7 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600">
              <FileText size={17} className="text-indigo-500" />
              {articles.length} {articles.length === 1 ? "article" : "articles"} saved
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void loadArticles()}
                className="mt-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-slate-500">
              <LoaderCircle size={20} className="animate-spin text-indigo-500" />
              Loading your saved articles...
            </div>
          ) : articles.length === 0 ? (
            <section className="paperly-saved-panel rounded-[28px] px-6 py-14 text-center sm:px-10">
              <div className="paperly-saved-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-indigo-500">
                <Bookmark size={29} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-slate-800">
                Your library is waiting
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                Save stories from your dashboard using the bookmark icon.
                They will appear here and remain saved between visits.
              </p>

              <Link
                href="/dashboard"
                className="paperly-saved-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
              >
                Discover stories
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </section>
          ) : (
            <section
              aria-label="Saved stories"
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {articles.map((article) => (
                <article
                  key={article.url}
                  className="paperly-saved-card flex min-w-0 flex-col rounded-[24px] p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-indigo-100/70 px-3 py-1.5 text-[11px] font-bold text-indigo-700">
                      {article.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setConfirmArticle(article);
                      }}
                      disabled={removingUrl === article.url}
                      aria-label={`Delete ${article.title} from saved articles`}
                      title="Delete saved article"
                      className="paperly-delete-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-500 transition duration-200 hover:-translate-y-0.5 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <h2 className="mt-5 text-lg font-extrabold leading-snug text-slate-800">
                    {article.title}
                  </h2>

                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                    {article.summary ||
                      "Open the original source to read this story."}
                  </p>

                  <div className="mt-5 border-t border-slate-200/70 pt-4">
                    <p className="truncate text-xs font-bold text-slate-600">
                      {article.source}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Saved {formatSavedDate(article.savedAt)}
                    </p>

                    {safeHttpUrl(article.url) ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="paperly-saved-primary mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
                      >
                        Read original article
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">
                        Original link unavailable
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>

      {/* Delete confirmation dialog */}
      {confirmArticle && (
        <div
          className="paperly-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !removingUrl
            ) {
              setConfirmArticle(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="paperly-delete-dialog w-full max-w-md rounded-[28px] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="paperly-delete-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-red-500">
                <AlertTriangle size={27} />
              </div>

              <button
                type="button"
                onClick={() => setConfirmArticle(null)}
                disabled={Boolean(removingUrl)}
                aria-label="Close confirmation dialog"
                className="paperly-modal-close flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:text-slate-800 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-red-500">
              Remove from your library
            </p>

            <h2
              id="delete-dialog-title"
              className="mt-2 text-2xl font-black tracking-tight text-slate-800"
            >
              Delete this article?
            </h2>

            <p
              id="delete-dialog-description"
              className="mt-3 text-sm leading-7 text-slate-500"
            >
              Are you sure you want to remove this saved article? You can save
              it again from your newspaper later.
            </p>

            <div className="paperly-confirm-article mt-5 rounded-2xl p-4">
              <p className="line-clamp-3 text-sm font-bold leading-6 text-slate-700">
                {confirmArticle.title}
              </p>
              <p className="mt-2 truncate text-xs text-slate-500">
                {confirmArticle.source}
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmArticle(null)}
                disabled={Boolean(removingUrl)}
                className="paperly-cancel-button rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:text-slate-900 disabled:opacity-50 sm:min-w-28"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void removeArticle(confirmArticle.url)}
                disabled={Boolean(removingUrl)}
                className="paperly-confirm-delete flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-red-700 transition hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-36"
              >
                {removingUrl === confirmArticle.url ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Yes, delete
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx global>{`
        .paperly-saved-layout {
          color: #334155;
        }

        .paperly-saved-panel,
        .paperly-saved-card {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff;
        }

        .paperly-saved-icon {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f6f7ff, #e8ecfa);
          box-shadow:
            5px 5px 10px #d4d9e6,
            -5px -5px 10px #ffffff;
        }

        .paperly-saved-count {
          background: #eef1f9;
          box-shadow:
            inset 3px 3px 6px #d4d9e6,
            inset -3px -3px 6px #ffffff;
        }

        .paperly-saved-card {
          transition:
            transform 250ms ease,
            box-shadow 250ms ease;
        }

        .paperly-saved-card:hover {
          transform: translateY(-3px);
          box-shadow:
            11px 12px 22px #cfd5e3,
            -9px -9px 20px #ffffff;
        }

        /* Soft red neumorphic delete button */
        .paperly-delete-button {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #fff7f7, #f8e5e8);
          box-shadow:
            4px 4px 9px #d9d5df,
            -4px -4px 9px #ffffff;
        }

        .paperly-delete-button:hover {
          background: linear-gradient(145deg, #ffeded, #f6d9de);
          box-shadow:
            inset 2px 2px 5px #e8cbd0,
            inset -2px -2px 5px #ffffff;
        }

        .paperly-modal-backdrop {
          background: rgba(38, 43, 65, 0.42);
          backdrop-filter: blur(8px);
          animation: paperly-fade-in 180ms ease-out;
        }

        .paperly-delete-dialog {
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: linear-gradient(145deg, #f8f9ff, #edf0f9);
          box-shadow:
            16px 16px 40px rgba(42, 48, 70, 0.22),
            -8px -8px 25px rgba(255, 255, 255, 0.8);
          animation: paperly-dialog-in 220ms ease-out;
        }

        .paperly-delete-icon {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #fff5f5, #f8e2e6);
          box-shadow:
            5px 5px 10px #d8d5e0,
            -5px -5px 10px #ffffff;
        }

        .paperly-confirm-article {
          background: #eef1f9;
          box-shadow:
            inset 3px 3px 6px #d4d9e6,
            inset -3px -3px 6px #ffffff;
        }

        .paperly-modal-close,
        .paperly-cancel-button {
          background: linear-gradient(145deg, #f7f8ff, #e9edf8);
          box-shadow:
            3px 3px 6px #d4d9e6,
            -3px -3px 6px #ffffff;
        }

        .paperly-confirm-delete {
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: linear-gradient(145deg, #ffeded, #f6d9de);
          box-shadow:
            4px 4px 9px #d9d5df,
            -4px -4px 9px #ffffff;
        }

        .paperly-confirm-delete:hover:not(:disabled) {
          background: linear-gradient(145deg, #ffe1e4, #f3cbd2);
          box-shadow:
            inset 2px 2px 5px #e8c4cb,
            inset -2px -2px 5px #ffffff;
        }

        .paperly-saved-primary {
          background: linear-gradient(110deg, #6366f1, #7c3aed);
          box-shadow:
            0 6px 13px rgba(99, 102, 241, 0.2),
            inset 1px 1px 0 rgba(255, 255, 255, 0.3);
          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .paperly-saved-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 18px rgba(99, 102, 241, 0.3);
        }

        @keyframes paperly-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes paperly-dialog-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-saved-card,
          .paperly-saved-primary,
          .paperly-delete-button,
          .paperly-modal-backdrop,
          .paperly-delete-dialog {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

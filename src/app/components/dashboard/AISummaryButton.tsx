
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  X,
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

type GeneratedSummary = {
  headline: string;
  overview: string;
  keyPoints: string[];
  conclusion: string;
};

type ApiError = {
  error?: string;
  code?: string;
};

type Props = {
  article: Article;
  onCompleted: (url: string) => void;
};

function isGeneratedSummary(value: unknown): value is GeneratedSummary {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;

  return (
    typeof result.headline === "string" &&
    typeof result.overview === "string" &&
    Array.isArray(result.keyPoints) &&
    result.keyPoints.every((point) => typeof point === "string") &&
    typeof result.conclusion === "string"
  );
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const data: unknown = await response.json().catch(() => null);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  return data as Record<string, unknown>;
}

function getErrorMessage(data: ApiError, fallback: string) {
  return typeof data.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

export default function AISummaryButton({
  article,
  onCompleted,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const completedUrlRef = useRef<string | null>(null);
  const summaryDialogRef = useRef<HTMLElement>(null);
  const pricingDialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Portals must only be rendered after the component mounts in the browser.
  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSummary = useCallback(() => {
    if (loading) return;

    setOpen(false);

    // Remove the article only after its summary dialog has been closed.
    if (
      summary &&
      completedUrlRef.current !== article.url
    ) {
      completedUrlRef.current = article.url;
      onCompleted(article.url);
    }
  }, [article.url, loading, onCompleted, summary]);

  const closePricing = useCallback(() => {
    setPricingOpen(false);
  }, []);

  // Lock background scrolling and support Escape while a dialog is open.
  useEffect(() => {
    if (!open && !pricingOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || loading) return;

      if (pricingOpen) {
        closePricing();
      } else if (open) {
        closeSummary();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closePricing,
    closeSummary,
    loading,
    open,
    pricingOpen,
  ]);

  // Move keyboard focus into the active dialog.
  useEffect(() => {
    if (!mounted) return;

    if (pricingOpen) {
      pricingDialogRef.current?.focus();
    } else if (open) {
      summaryDialogRef.current?.focus();
    }
  }, [mounted, open, pricingOpen]);

  const handleBackdropMouseDown = (
    event: MouseEvent<HTMLDivElement>,
    close: () => void,
  ) => {
    if (event.target === event.currentTarget) close();
  };

  async function generateSummary() {
    if (loading) return;

    setLoading(true);
    setError("");
    setSummary(null);
    setOpen(true);

    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article }),
      });

      const data = await readJson(response);

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (
        response.status === 429 &&
        data.code === "SUMMARY_LIMIT_REACHED"
      ) {
        setOpen(false);
        setPricingOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data as ApiError,
            "Unable to generate the summary. Please try again.",
          ),
        );
      }

      if (!isGeneratedSummary(data.summary)) {
        throw new Error("The AI returned an incomplete summary.");
      }

      const result = data.summary;

      // Persist the article only after summary generation succeeds.
      const historyResponse = await fetch("/api/reading-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });

      const historyData = await readJson(historyResponse);

      if (historyResponse.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!historyResponse.ok) {
        throw new Error(
          getErrorMessage(
            historyData as ApiError,
            "The summary was generated, but saving Reading History failed. Please try again.",
          ),
        );
      }

      setSummary(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const summaryDialog = mounted && open
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) =>
            handleBackdropMouseDown(event, closeSummary)
          }
        >
          <section
            ref={summaryDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-summary-title"
            aria-describedby="ai-summary-article-title"
            className="my-auto w-full max-w-2xl rounded-[28px] border border-white/90 bg-[#eef1f9] p-5 shadow-[12px_12px_28px_#8790a5,-10px_-10px_28px_#ffffff] outline-none sm:p-8"
          >
            <header className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-indigo-600 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                <Sparkles size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Paperly AI · Article intelligence
                </p>
                <h2
                  id="ai-summary-title"
                  className="mt-2 text-xl font-black text-slate-800"
                >
                  AI Summary
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close summary"
                disabled={loading}
                onClick={closeSummary}
                className="rounded-xl p-2 text-slate-500 shadow-[4px_4px_8px_#d2d7e4,-4px_-4px_8px_#ffffff] transition hover:text-indigo-600 disabled:cursor-wait disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>

            <p
              id="ai-summary-article-title"
              className="mt-5 text-sm font-semibold leading-6 text-slate-600"
            >
              {article.title}
            </p>

            {loading && (
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-44 flex-col items-center justify-center gap-3 text-center"
              >
                <LoaderCircle
                  size={32}
                  className="animate-spin text-indigo-500"
                />
                <p className="font-bold text-slate-700">
                  Reading the available article information...
                </p>
                <p className="text-sm text-slate-500">
                  Generating your AI-powered summary.
                </p>
              </div>
            )}

            {error && !loading && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p>{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void generateSummary()}
                  className="mt-3 font-bold underline"
                >
                  Retry summary
                </button>
              </div>
            )}

            {summary && !loading && (
              <div className="mt-5 max-h-[55vh] space-y-5 overflow-y-auto pr-1">
                <div className="rounded-2xl p-4 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                  <h3 className="font-extrabold text-slate-800">
                    {summary.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {summary.overview}
                  </p>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800">
                    Key takeaways
                  </h3>

                  <ul className="mt-3 space-y-3">
                    {summary.keyPoints.map((point, index) => (
                      <li
                        key={`${index}-${point}`}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-indigo-600 shadow-[3px_3px_6px_#d2d7e4,-3px_-3px_6px_#ffffff]">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <h3 className="font-extrabold text-indigo-800">
                    The takeaway
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {summary.conclusion}
                  </p>
                </div>

                <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  Saved to your Reading History
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Read original article
                    <ArrowUpRight size={15} />
                  </a>

                  <button
                    type="button"
                    onClick={closeSummary}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
                  >
                    Done reading
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>,
        document.body,
      )
    : null;

  const pricingDialog = mounted && pricingOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-900/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) =>
            handleBackdropMouseDown(event, closePricing)
          }
        >
          <section
            ref={pricingDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
            className="relative my-auto w-full max-w-lg rounded-[28px] border border-white/90 bg-[#eef1f9] p-5 shadow-[12px_12px_28px_#8790a5,-10px_-10px_28px_#ffffff] outline-none sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Paperly AI Membership
                </p>
                <h2
                  id="upgrade-title"
                  className="mt-2 text-2xl font-black text-slate-800"
                >
                  Your free summaries are used up
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You've reached today's limit. Upgrade for more
                  AI-powered article summaries, or come back tomorrow.
                </p>
              </div>

              <button
                type="button"
                onClick={closePricing}
                aria-label="Close pricing"
                className="shrink-0 rounded-xl p-2 text-slate-600 shadow-[4px_4px_8px_#d2d7e4,-4px_-4px_8px_#ffffff] transition hover:text-indigo-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl p-4 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-800">
                    Plus
                  </span>
                  <span className="font-black text-slate-800">
                    $4.99/mo
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  30 AI summaries per day
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-200 p-4 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-800">
                    Pro
                  </span>
                  <span className="font-black text-slate-800">
                    $9.99/mo
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  100 AI summaries per day
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              onClick={closePricing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Explore all plans
              <ArrowUpRight size={17} />
            </Link>

            <button
              type="button"
              onClick={closePricing}
              className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:text-indigo-600"
            >
              Maybe tomorrow
            </button>

            <p className="mt-2 text-center text-xs leading-5 text-slate-400">
              Prices shown in USD. Paid checkout must be configured
              separately before subscriptions can be purchased.
            </p>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (summary) {
            setOpen(true);
            return;
          }

          void generateSummary();
        }}
        disabled={loading}
        aria-haspopup="dialog"
        className="inline-flex max-w-full items-center justify-center gap-2 rounded-xl border border-white/90 bg-gradient-to-br from-[#f8f9ff] to-[#e9edf9] px-3 py-2.5 text-sm font-bold text-indigo-700 shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff] transition hover:-translate-y-0.5 hover:text-indigo-800 active:translate-y-0 active:shadow-[inset_3px_3px_6px_#d2d7e4,inset_-3px_-3px_6px_#ffffff] disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:py-3"
      >
        {loading ? (
          <LoaderCircle size={17} className="shrink-0 animate-spin" />
        ) : (
          <Sparkles size={17} className="shrink-0" />
        )}
        <span className="truncate">
          {loading
            ? "Generating..."
            : summary
              ? "View AI Summary"
              : "AI Summary"}
        </span>
      </button>

      {summaryDialog}
      {pricingDialog}
    </>
  );
}

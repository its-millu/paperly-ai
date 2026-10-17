
"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, LoaderCircle } from "lucide-react";

export type SaveableArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
};

type Props = {
  article: SaveableArticle;
};

export default function SaveArticleButton({ article }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSaved() {
      try {
        const response = await fetch("/api/saved-articles", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Could not check saved articles.");
        }

        const data = await response.json();

        setSaved(
          Array.isArray(data.articles) &&
            data.articles.some(
              (item: { url?: string }) => item.url === article.url,
            ),
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Bookmark status unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void checkSaved();

    return () => controller.abort();
  }, [article.url]);

  async function toggleSaved() {
    if (busy || loading) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/saved-articles", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          saved ? { url: article.url } : article,
        ),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to update bookmark.");
      }

      setSaved(!saved);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update bookmark.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggleSaved}
        disabled={loading || busy}
        aria-label={saved ? `Remove saved article: ${article.title}` : `Save article: ${article.title}`}
        aria-pressed={saved}
        title={saved ? "Remove from saved articles" : "Save article"}
        className={`paperly-bookmark-button flex h-10 w-10 items-center justify-center rounded-xl transition-all disabled:cursor-wait disabled:opacity-60 ${
          saved ? "paperly-bookmark-active" : ""
        }`}
      >
        {loading || busy ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : saved ? (
          <Check size={17} strokeWidth={2.4} />
        ) : (
          <Bookmark size={17} strokeWidth={1.9} />
        )}
      </button>

      {error && (
        <span role="status" className="max-w-32 text-right text-[10px] text-red-600">
          {error}
        </span>
      )}

      <style jsx global>{`
        .paperly-bookmark-button {
          color: #64748b;
          background: linear-gradient(145deg, #f8f9ff, #e9edf8);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            4px 4px 8px rgba(201, 207, 226, 0.8),
            -4px -4px 8px rgba(255, 255, 255, 0.95);
        }

        .paperly-bookmark-button:hover:not(:disabled) {
          color: #4f46e5;
          box-shadow:
            inset 2px 2px 5px rgba(201, 207, 226, 0.85),
            inset -2px -2px 5px rgba(255, 255, 255, 0.95);
        }

        .paperly-bookmark-active {
          color: #4f46e5;
          background: linear-gradient(145deg, #edf0ff, #e2e7fb);
          box-shadow:
            inset 3px 3px 6px rgba(192, 200, 228, 0.8),
            inset -3px -3px 6px rgba(255, 255, 255, 0.95);
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-bookmark-button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

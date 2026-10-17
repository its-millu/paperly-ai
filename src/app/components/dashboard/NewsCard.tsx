
"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Clock3,
  Check,
} from "lucide-react";

export type Article = {
  id: number;
  category: string;
  title: string;
  summary: string;
  source: string;
  readTime: string;
  accent: string;
};

export default function NewsCard({ article }: { article: Article }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="paperly-news-card group relative flex h-full flex-col overflow-hidden rounded-[26px] p-5 sm:p-6">
      {/* Decorative accent */}
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-[80px] bg-indigo-100/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

      {/* Category and save */}
      <div className="relative flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wide ${article.accent}`}
        >
          {article.category}
        </span>

        <button
          type="button"
          aria-label={saved ? `Unsave ${article.title}` : `Save ${article.title}`}
          aria-pressed={saved}
          onClick={() => setSaved((previous) => !previous)}
          className={`paperly-news-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
            saved
              ? "paperly-news-icon-active text-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          {saved ? (
            <Check size={17} strokeWidth={2.4} />
          ) : (
            <Bookmark size={17} strokeWidth={1.9} />
          )}
        </button>
      </div>

      {/* Article content */}
      <div className="relative flex-1">
        <h3 className="mt-5 text-[17px] font-bold leading-[1.55] tracking-tight text-slate-800 transition-colors duration-200 group-hover:text-indigo-700 sm:text-lg">
          {article.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {article.summary}
        </p>
      </div>

      {/* Article metadata */}
      <div className="paperly-news-meta relative mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3.5 py-3">
        <span className="max-w-[60%] truncate text-xs font-semibold text-slate-600">
          {article.source}
        </span>

        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock3 size={14} strokeWidth={1.8} />
          {article.readTime}
        </span>
      </div>

      {/* Read action */}
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("paperly:read-summary", {
              detail: { articleId: article.id },
            })
          )
        }
        className="paperly-news-read relative mt-4 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-indigo-700 transition-all duration-200"
      >
        <span>Read summary</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/50 transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowUpRight size={16} />
        </span>
      </button>

      <style jsx global>{`
        .paperly-news-card {
          background: linear-gradient(145deg, #f8f9ff 0%, #edf0f9 100%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            8px 8px 18px rgba(202, 208, 226, 0.7),
            -8px -8px 18px rgba(255, 255, 255, 0.95);
          transition:
            transform 260ms ease,
            box-shadow 260ms ease,
            border-color 260ms ease;
        }

        .paperly-news-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 1);
          box-shadow:
            11px 13px 24px rgba(194, 201, 222, 0.72),
            -8px -8px 20px rgba(255, 255, 255, 0.98);
        }

        .paperly-news-icon {
          background: linear-gradient(145deg, #f8f9ff, #e9edf8);
          box-shadow:
            4px 4px 8px rgba(201, 207, 226, 0.8),
            -4px -4px 8px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-icon:hover {
          box-shadow:
            inset 2px 2px 5px rgba(201, 207, 226, 0.85),
            inset -2px -2px 5px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-icon-active {
          background: linear-gradient(145deg, #edf0ff, #e2e7fb);
          box-shadow:
            inset 3px 3px 6px rgba(192, 200, 228, 0.8),
            inset -3px -3px 6px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-meta {
          background: linear-gradient(145deg, #edf0f9, #f6f7fd);
          box-shadow:
            inset 3px 3px 6px rgba(202, 208, 226, 0.7),
            inset -3px -3px 6px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-read {
          background: linear-gradient(145deg, #f8f9ff, #e9edf9);
          box-shadow:
            4px 4px 9px rgba(201, 207, 226, 0.75),
            -4px -4px 9px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-read:hover {
          box-shadow:
            inset 3px 3px 6px rgba(201, 207, 226, 0.8),
            inset -3px -3px 6px rgba(255, 255, 255, 0.95);
        }

        .paperly-news-read:focus-visible,
        .paperly-news-icon:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-news-card,
          .paperly-news-icon,
          .paperly-news-read,
          .paperly-news-read span {
            transition: none !important;
          }

          .paperly-news-card:hover {
            transform: none;
          }
        }
      `}</style>
    </article>
  );
}

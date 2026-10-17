
import { ArrowUpRight, Bookmark, Clock3 } from "lucide-react";

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
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${article.accent}`}>
          {article.category}
        </span>
        <button
          aria-label={`Save ${article.title}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Bookmark size={17} />
        </button>
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-indigo-700">
        {article.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {article.summary}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">
          {article.source}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 size={14} />
          {article.readTime}
        </span>
      </div>

      <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
        Read summary <ArrowUpRight size={16} />
      </button>
    </article>
  );
}

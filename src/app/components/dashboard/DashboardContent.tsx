
"use client";

import { useState } from "react";
import {
  Bookmark,
  BookOpen,
  Clock3,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import StatCard from "./StatCard";
import NewsCard, { type Article } from "./NewsCard";

const categories = ["For You", "Technology", "World", "Business", "Science"];

const articles: Article[] = [
  {
    id: 1,
    category: "Technology",
    title: "AI research is reshaping how people discover information",
    summary:
      "A look at how intelligent tools can organize complex stories, surface useful context, and help readers understand developments faster.",
    source: "Technology Desk",
    readTime: "4 min read",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    id: 2,
    category: "Business",
    title: "The trends changing how modern businesses operate",
    summary:
      "Explore the role of automation, digital services, and data-driven decisions in the changing business landscape.",
    source: "Business Desk",
    readTime: "6 min read",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    id: 3,
    category: "Science",
    title: "New discoveries offer fresh perspectives on our world",
    summary:
      "Research teams continue to investigate important scientific questions, building on evidence and testing new ideas.",
    source: "Science Desk",
    readTime: "5 min read",
    accent: "bg-emerald-100 text-emerald-700",
  },
];

export default function DashboardContent() {
  const [activeCategory, setActiveCategory] = useState("For You");

  const filteredArticles =
    activeCategory === "For You"
      ? articles
      : articles.filter((article) => article.category === activeCategory);

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-200/60 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50">
            <Sparkles size={14} />
            YOUR PERSONALIZED NEWSROOM
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Your world. Your daily paper.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
            Catch up on the stories that matter. Your reading workspace brings
            news, topics, and AI-powered summaries together.
          </p>

          <a
            href="#latest-stories"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
          >
            Explore today's stories
            <TrendingUp size={17} />
          </a>
        </div>

        <div className="absolute bottom-8 right-10 hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md lg:flex">
          <FileText size={42} strokeWidth={1.3} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Articles read"
          value="0"
          detail="Your reading journey starts here"
          icon={BookOpen}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Saved stories"
          value="0"
          detail="Build your personal library"
          icon={Bookmark}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Reading time"
          value="0 min"
          detail="Time spent learning"
          icon={Clock3}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Topics followed"
          value="0"
          detail="Personalize your daily paper"
          icon={Sparkles}
          color="bg-violet-50 text-violet-600"
        />
      </section>

      <section id="latest-stories" className="scroll-mt-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              YOUR NEWSROOM
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Today's briefing
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              A starting point for your personalized reading experience.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
            Demo content · Not live news
          </span>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredArticles.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-800">
              No sample stories in this category yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Live news feeds will populate this section when we connect the
              content pipeline.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Sparkles size={23} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Make Paperly yours
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Choose your interests and preferred sources to build a briefing
              that fits your day. We'll connect these preferences to your
              account in the next milestone.
            </p>
            <a
              href="/dashboard/settings"
              className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Personalize your edition
            </a>
          </div>
        </div>
      </section>

      <footer className="pb-2 text-center text-xs text-slate-400">
        Paperly AI · Your world, thoughtfully summarized.
      </footer>
    </div>
  );
}

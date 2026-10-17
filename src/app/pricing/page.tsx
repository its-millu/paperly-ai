
"use client";

import Link from "next/link";
import { ArrowLeft, Check, LockKeyhole, Sparkles } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "A daily dose of personalized news.",
    limit: "2 AI summaries per day",
    features: [
      "Personalized daily newspaper",
      "Save articles",
      "Reading history",
      "Previous editions",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "$4.99",
    description: "For curious readers who want more.",
    limit: "30 AI summaries per day",
    features: [
      "Everything in Free",
      "30 daily AI summaries",
      "More room for research",
      "Premium reading experience",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    description: "For readers who never stop exploring.",
    limit: "100 AI summaries per day",
    features: [
      "Everything in Plus",
      "100 daily AI summaries",
      "Highest included usage limit",
      "Premium reading experience",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#eef1f9] px-4 py-10 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/discover"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff]"
        >
          <ArrowLeft size={16} />
          Back to Discover
        </Link>

        <header className="mx-auto mt-10 max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-indigo-600 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
            <Sparkles size={26} />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
            Paperly AI Membership
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Your world. Your daily paper.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Choose the reading plan that fits you. Read the news freely
            and upgrade when you need more AI summaries.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[28px] border border-white/80 bg-[#eef1f9] p-6 shadow-[10px_10px_22px_#cbd1df,-10px_-10px_22px_#ffffff] ${
                plan.popular ? "ring-2 ring-indigo-300" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute right-5 top-5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-700">
                  MOST POPULAR
                </span>
              )}

              <h2 className="text-xl font-black">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>

              <div className="mt-5 rounded-2xl p-4 font-bold text-indigo-700 shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]">
                {plan.limit}
              </div>

              <ul className="mt-6 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link
                  href="/dashboard/discover"
                  className="mt-8 flex items-center justify-center rounded-xl px-4 py-3 font-bold text-slate-700 shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff]"
                >
                  Continue free
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Payment checkout has not been connected yet."
                  className="mt-8 flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-500"
                >
                  <LockKeyhole size={16} />
                  Checkout coming soon
                </button>
              )}
            </article>
          ))}
        </section>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-slate-500">
          Prices are in USD and are proposed launch prices. Paid plans
          are not activated until secure payment processing is connected.
          Daily AI limits reset at midnight Pakistan time.
        </p>
      </div>
    </main>
  );
}

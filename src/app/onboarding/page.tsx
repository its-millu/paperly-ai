
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Newspaper,
  Sparkles,
  Brain,
  BookOpen,
  Layers3,
  Compass,
  LoaderCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

const topics = [
  { name: "Technology", icon: "💻" },
  { name: "Artificial Intelligence", icon: "🤖" },
  { name: "Science", icon: "🔬" },
  { name: "Business", icon: "📈" },
  { name: "World", icon: "🌍" },
  { name: "Politics", icon: "🏛️" },
  { name: "Health", icon: "🩺" },
  { name: "Climate", icon: "🌱" },
  { name: "Startups", icon: "🚀" },
  { name: "Sports", icon: "⚽" },
  { name: "Culture", icon: "🎨" },
  { name: "Education", icon: "📚" },
] as const;

type ReadingDepth = "brief" | "balanced" | "detailed";
type PaperSize = "compact" | "standard" | "extended";

type Preferences = {
  interests: string[];
  readingDepth: ReadingDepth;
  paperSize: PaperSize;
};

type SavedPreferences = Preferences & {
  onboardingCompleted?: boolean;
};

const readingOptions = [
  {
    value: "brief",
    title: "Quick Read",
    description: "The essentials, without the noise.",
    icon: Zap,
    detail: "5–10 min",
  },
  {
    value: "balanced",
    title: "Balanced",
    description: "The right mix of facts and context.",
    icon: BookOpen,
    detail: "10–20 min",
  },
  {
    value: "detailed",
    title: "Deep Dive",
    description: "More background and deeper insights.",
    icon: Brain,
    detail: "20+ min",
  },
] as const;

const paperOptions = [
  {
    value: "compact",
    title: "Compact",
    description: "Your essential daily briefing.",
    stories: "8 stories",
  },
  {
    value: "standard",
    title: "Standard",
    description: "A balanced mix of daily coverage.",
    stories: "18 stories",
  },
  {
    value: "extended",
    title: "Extended",
    description: "Explore more stories and topics.",
    stories: "30 stories",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>({
    interests: [],
    readingDepth: "balanced",
    paperSize: "standard",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      try {
        const response = await fetch("/api/preferences", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Unexpected response from preferences API (HTTP ${response.status}).`,
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load preferences.");
        }

        if (!active) return;

        const saved = data.preferences as
          | SavedPreferences
          | undefined;

        if (saved?.onboardingCompleted) {
          router.replace("/dashboard");
          return;
        }

        setPreferences({
          interests: saved?.interests ?? [],
          readingDepth: saved?.readingDepth ?? "balanced",
          paperSize: saved?.paperSize ?? "standard",
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your preferences.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPreferences();

    return () => {
      active = false;
    };
  }, [router]);

  function toggleTopic(topic: string) {
    setPreferences((current) => ({
      ...current,
      interests: current.interests.includes(topic)
        ? current.interests.filter((item) => item !== topic)
        : current.interests.length < 4
          ? [...current.interests, topic]
          : current.interests,
    }));

    setError("");
  }

  async function savePreferences() {
    setError("");

    if (preferences.interests.length === 0) {
      setError("Choose at least one topic to personalize your paper.");
      setStep(1);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected response while saving preferences.");
      }

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to save preferences.");
      }

      window.location.assign("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="neo-onboarding flex min-h-screen items-center justify-center px-5">
        <div className="neo-loader-card flex flex-col items-center gap-5 rounded-[2rem] p-10">
          <div className="neo-logo flex h-16 w-16 items-center justify-center rounded-2xl">
            <Newspaper size={30} />
          </div>
          <LoaderCircle className="animate-spin text-indigo-500" size={25} />
          <p className="text-sm font-medium text-slate-500">
            Preparing your personal paper...
          </p>
        </div>
        <OnboardingStyles />
      </main>
    );
  }

  return (
    <main className="neo-onboarding relative min-h-screen overflow-hidden px-4 py-7 sm:px-6 sm:py-10">
      {/* Animated background atmosphere */}
      <div className="neo-orb neo-orb-one" aria-hidden="true" />
      <div className="neo-orb neo-orb-two" aria-hidden="true" />
      <div className="neo-orb neo-orb-three" aria-hidden="true" />
      <div className="neo-grid-pattern" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Brand header */}
        <header className="neo-enter flex items-center justify-between gap-4">
          <a
            href="/"
            className="group inline-flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span className="neo-logo flex h-12 w-12 items-center justify-center rounded-2xl text-indigo-600 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
              <Newspaper size={23} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Paperly <span className="text-indigo-600">AI</span>
            </span>
          </a>

          <div className="neo-pill hidden items-center gap-2 rounded-full px-4 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">
              Your personal news experience
            </span>
          </div>
        </header>

        {/* Intro */}
        <section className="neo-enter mx-auto mb-8 mt-10 max-w-2xl text-center sm:mb-10 sm:mt-14">
          <div className="neo-pill mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2">
            <Sparkles size={15} className="text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700">
              Your world. Your daily paper.
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-slate-800 sm:text-5xl">
            A newspaper that
            <br />
            <span className="neo-gradient-text">gets you.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            A few quick choices. A smarter daily briefing. Let&apos;s build a
            paper around the things you actually care about.
          </p>
        </section>

        {/* Main onboarding card */}
        <section className="neo-main-card neo-enter mx-auto max-w-4xl rounded-[2rem] p-5 sm:rounded-[2.5rem] sm:p-9 lg:p-11">
          {/* Progress header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="neo-step-icon flex h-11 w-11 items-center justify-center rounded-2xl text-indigo-600">
                {step === 1 ? <Compass size={21} /> : <Layers3 size={21} />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {step === 1 ? "Your interests" : "Your reading style"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Step {step} of 2
                </p>
              </div>
            </div>

            <span className="neo-pill rounded-full px-3 py-2 text-xs font-bold text-indigo-700">
              {step === 1 ? "50%" : "100%"}
            </span>
          </div>

          <div
            className="neo-progress-track mt-6 h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={2}
            aria-valuenow={step}
          >
            <div
              className={`neo-progress-fill h-full rounded-full ${
                step === 2 ? "neo-progress-complete" : ""
              }`}
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {/* Step one: topics */}
          {step === 1 ? (
            <div key="interests" className="neo-step-content">
              <div className="mt-8 sm:mt-10">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                  What sparks your curiosity?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Choose up to four topics. We&apos;ll use them to personalize
                  your daily paper.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {topics.map((topic, index) => {
                  const selected = preferences.interests.includes(topic.name);
                  const limitReached =
                    preferences.interests.length >= 4 && !selected;

                  return (
                    <button
                      key={topic.name}
                      type="button"
                      disabled={limitReached}
                      onClick={() => toggleTopic(topic.name)}
                      aria-pressed={selected}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className={`neo-topic-card neo-stagger group relative flex min-h-[105px] flex-col items-start justify-between overflow-hidden rounded-2xl p-4 text-left sm:min-h-[118px] sm:p-5 ${
                        selected ? "neo-topic-selected" : ""
                      }`}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">
                          {topic.icon}
                        </span>

                        <span
                          className={`neo-check flex h-6 w-6 items-center justify-center rounded-full ${
                            selected ? "neo-check-active" : ""
                          }`}
                        >
                          {selected && <Check size={14} strokeWidth={3} />}
                        </span>
                      </span>

                      <span className="mt-3 text-xs font-bold leading-5 text-slate-700 sm:text-sm">
                        {topic.name}
                      </span>

                      {selected && (
                        <span className="neo-selection-glow" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-500">
                  <span className="font-extrabold text-indigo-600">
                    {preferences.interests.length}
                  </span>{" "}
                  of 4 topics selected
                </p>

                <div className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`neo-dot ${
                        index < preferences.interests.length
                          ? "neo-dot-active"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (preferences.interests.length === 0) {
                    setError("Choose at least one topic to continue.");
                    return;
                  }

                  setError("");
                  setStep(2);
                }}
                className="neo-primary-button mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold text-white sm:text-base"
              >
                Personalize my paper
                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          ) : (
            <div key="reading-style" className="neo-step-content">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="neo-back-button mt-7 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500"
              >
                <ArrowLeft size={16} />
                Back to interests
              </button>

              <div className="mt-5">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                  Make it your kind of read.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Set your reading depth and daily paper size. You can change
                  these preferences later.
                </p>
              </div>

              {/* Reading depth */}
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="neo-small-icon flex h-9 w-9 items-center justify-center rounded-xl text-indigo-600">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Reading depth
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      How much context do you like?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {readingOptions.map((option, index) => {
                    const selected =
                      preferences.readingDepth === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            readingDepth: option.value,
                          }))
                        }
                        style={{ animationDelay: `${index * 80}ms` }}
                        className={`neo-choice-card neo-stagger rounded-2xl p-4 text-left ${
                          selected ? "neo-choice-selected" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`neo-option-icon flex h-10 w-10 items-center justify-center rounded-xl ${
                              selected ? "neo-option-icon-active" : ""
                            }`}
                          >
                            <Icon size={19} />
                          </span>
                          <span
                            className={`neo-check flex h-6 w-6 items-center justify-center rounded-full ${
                              selected ? "neo-check-active" : ""
                            }`}
                          >
                            {selected && <Check size={14} strokeWidth={3} />}
                          </span>
                        </div>

                        <p className="mt-4 text-sm font-extrabold text-slate-800">
                          {option.title}
                        </p>
                        <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                          {option.description}
                        </p>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {option.detail}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paper size */}
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="neo-small-icon flex h-9 w-9 items-center justify-center rounded-xl text-indigo-600">
                    <Layers3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Daily paper size
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      How many stories should your edition include?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {paperOptions.map((option, index) => {
                    const selected = preferences.paperSize === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            paperSize: option.value,
                          }))
                        }
                        style={{ animationDelay: `${index * 80}ms` }}
                        className={`neo-choice-card neo-stagger rounded-2xl p-4 text-left ${
                          selected ? "neo-choice-selected" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            {option.stories}
                          </span>
                          <span
                            className={`neo-check flex h-6 w-6 items-center justify-center rounded-full ${
                              selected ? "neo-check-active" : ""
                            }`}
                          >
                            {selected && <Check size={14} strokeWidth={3} />}
                          </span>
                        </div>

                        <p className="mt-4 text-sm font-extrabold text-slate-800">
                          {option.title}
                        </p>
                        <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="neo-summary mt-7 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="neo-small-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-indigo-600">
                    <Sparkles size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-800">
                      Your paper, your rules.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {preferences.interests.join(" · ")}{" "}
                      <span className="text-slate-400">
                        / {preferences.readingDepth} reading /{" "}
                        {preferences.paperSize} edition
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={savePreferences}
                className="neo-primary-button mt-7 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Creating your paper...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} />
                    Create my personal paper
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="neo-error mt-5 flex items-start gap-3 rounded-2xl p-4 text-sm"
            >
              <span className="mt-0.5">
                <ShieldCheck size={18} />
              </span>
              <p>{error}</p>
            </div>
          )}

          <div className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
            <ShieldCheck size={14} />
            <span>Your preferences are saved securely to your account.</span>
          </div>
        </section>

        <footer className="neo-enter mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-5 text-center text-[11px] text-slate-400">
          <span>Built around your curiosity.</span>
          <span className="hidden sm:inline">•</span>
          <span>Read what matters.</span>
          <span className="hidden sm:inline">•</span>
          <span>Stay informed.</span>
        </footer>
      </div>

      <OnboardingStyles />
    </main>
  );
}

function OnboardingStyles() {
  return (
    <style jsx global>{`
      .neo-onboarding {
        --neo-bg: #eef1f9;
        --neo-light: #ffffff;
        --neo-dark-shadow: #d0d5e2;
        --neo-indigo: #6366f1;
        background: var(--neo-bg);
        isolation: isolate;
      }

      .neo-onboarding,
      .neo-onboarding * {
        -webkit-tap-highlight-color: transparent;
      }

      .neo-grid-pattern {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        opacity: 0.23;
        background-image: radial-gradient(#a5aec5 0.7px, transparent 0.7px);
        background-size: 23px 23px;
        mask-image: linear-gradient(to bottom, black, transparent 90%);
      }

      .neo-orb {
        position: absolute;
        z-index: -1;
        border-radius: 9999px;
        pointer-events: none;
        filter: blur(2px);
        opacity: 0.6;
        animation: neo-float 12s ease-in-out infinite alternate;
      }

      .neo-orb-one {
        top: 4%;
        left: -120px;
        width: 330px;
        height: 330px;
        background: radial-gradient(
          circle at 35% 35%,
          #d8dcff,
          #e7eaff 48%,
          transparent 72%
        );
      }

      .neo-orb-two {
        top: 30%;
        right: -150px;
        width: 390px;
        height: 390px;
        animation-delay: -4s;
        background: radial-gradient(
          circle at 35% 35%,
          #d5e8ff,
          #e6edff 48%,
          transparent 72%
        );
      }

      .neo-orb-three {
        bottom: -160px;
        left: 25%;
        width: 360px;
        height: 360px;
        animation-delay: -7s;
        background: radial-gradient(
          circle at 35% 35%,
          #e4d9ff,
          #eee8ff 48%,
          transparent 72%
        );
      }

      .neo-main-card {
        background: linear-gradient(145deg, #f5f7ff, #eef1f9);
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow:
          18px 18px 48px rgba(177, 185, 207, 0.44),
          -18px -18px 48px rgba(255, 255, 255, 0.95),
          inset 1px 1px 0 rgba(255, 255, 255, 0.95);
        animation: neo-card-arrive 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .neo-loader-card {
        background: linear-gradient(145deg, #f5f7ff, #eef1f9);
        box-shadow:
          12px 12px 30px #d0d5e2,
          -12px -12px 30px #ffffff;
      }

      .neo-logo {
        background: linear-gradient(145deg, #f8f9ff, #e4e8f7);
        box-shadow:
          6px 6px 12px #d1d6e4,
          -6px -6px 12px #ffffff,
          inset 1px 1px 0 rgba(255, 255, 255, 0.95);
      }

      .neo-pill {
        background: linear-gradient(145deg, #f7f8ff, #e9edf7);
        box-shadow:
          4px 4px 9px #d4d8e5,
          -4px -4px 9px #ffffff;
      }

      .neo-step-icon,
      .neo-small-icon {
        background: linear-gradient(145deg, #f7f8ff, #e7eafa);
        box-shadow:
          5px 5px 10px #d5d9e6,
          -5px -5px 10px #ffffff;
      }

      .neo-gradient-text {
        background: linear-gradient(100deg, #6366f1 5%, #8b5cf6 50%, #3b82f6 95%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
      }

      .neo-progress-track {
        background: #e6e9f3;
        box-shadow:
          inset 4px 4px 8px #d2d7e5,
          inset -3px -3px 7px #ffffff;
      }

      .neo-progress-fill {
        position: relative;
        overflow: hidden;
        background: linear-gradient(90deg, #6366f1, #8b5cf6, #60a5fa);
        box-shadow: 0 0 14px rgba(99, 102, 241, 0.35);
        transition: width 650ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .neo-progress-fill::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 15%,
          rgba(255, 255, 255, 0.55) 48%,
          transparent 75%
        );
        animation: neo-shimmer 2.5s linear infinite;
      }

      .neo-topic-card,
      .neo-choice-card {
        position: relative;
        isolation: isolate;
        border: 1px solid rgba(255, 255, 255, 0.9);
        background: linear-gradient(145deg, #f7f8ff, #edf0f9);
        box-shadow:
          7px 7px 14px #d6dbe8,
          -7px -7px 14px #ffffff,
          inset 1px 1px 0 rgba(255, 255, 255, 0.8);
        transition:
          transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1),
          box-shadow 280ms ease,
          background 280ms ease,
          border-color 280ms ease;
      }

      .neo-topic-card:hover:not(:disabled),
      .neo-choice-card:hover {
        transform: translateY(-4px);
        box-shadow:
          10px 12px 18px #d1d7e5,
          -8px -8px 18px #ffffff,
          inset 1px 1px 0 #ffffff;
      }

      .neo-topic-card:active:not(:disabled),
      .neo-choice-card:active {
        transform: scale(0.975);
        box-shadow:
          inset 5px 5px 10px #d4d9e6,
          inset -5px -5px 10px #ffffff;
      }

      .neo-topic-card:disabled {
        cursor: not-allowed;
        opacity: 0.43;
        filter: saturate(0.6);
      }

      .neo-topic-selected,
      .neo-choice-selected {
        border-color: rgba(129, 140, 248, 0.8);
        background: linear-gradient(145deg, #edf0ff, #e4e9ff);
        box-shadow:
          inset 5px 5px 10px rgba(189, 196, 236, 0.68),
          inset -5px -5px 10px rgba(255, 255, 255, 0.96),
          0 0 0 2px rgba(129, 140, 248, 0.15);
      }

      .neo-topic-selected:hover:not(:disabled),
      .neo-choice-selected:hover {
        box-shadow:
          inset 4px 4px 8px rgba(189, 196, 236, 0.55),
          inset -4px -4px 8px #ffffff,
          0 0 0 3px rgba(129, 140, 248, 0.15);
      }

      .neo-check {
        flex-shrink: 0;
        color: #94a3b8;
        background: linear-gradient(145deg, #edf0f8, #f8f9ff);
        box-shadow:
          inset 2px 2px 4px #d9deea,
          inset -2px -2px 4px #ffffff;
        transition: all 250ms ease;
      }

      .neo-check-active {
        color: #ffffff;
        background: linear-gradient(145deg, #818cf8, #6366f1);
        box-shadow:
          0 3px 9px rgba(99, 102, 241, 0.35),
          inset 1px 1px 2px rgba(255, 255, 255, 0.4);
        animation: neo-check-pop 350ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
      }

      .neo-selection-glow {
        position: absolute;
        z-index: -1;
        top: -30px;
        right: -30px;
        width: 100px;
        height: 100px;
        border-radius: 9999px;
        background: radial-gradient(
          circle,
          rgba(129, 140, 248, 0.2),
          transparent 70%
        );
        animation: neo-glow 3s ease-in-out infinite alternate;
      }

      .neo-dot {
        width: 7px;
        height: 7px;
        border-radius: 99px;
        background: #d4d8e5;
        transition: all 250ms ease;
      }

      .neo-dot-active {
        width: 20px;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
      }

      .neo-option-icon {
        color: #64748b;
        background: linear-gradient(145deg, #f8f9ff, #e8ebf6);
        box-shadow:
          4px 4px 8px #d7dce9,
          -4px -4px 8px #ffffff;
        transition: all 250ms ease;
      }

      .neo-option-icon-active {
        color: #6366f1;
        background: linear-gradient(145deg, #e4e8ff, #f3f4ff);
        box-shadow:
          inset 3px 3px 6px #d1d6f0,
          inset -3px -3px 6px #ffffff;
      }

      .neo-summary {
        border: 1px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(145deg, #f0f2ff, #e8ebf8);
        box-shadow:
          inset 4px 4px 8px #d9deeb,
          inset -4px -4px 8px #ffffff;
      }

      .neo-primary-button {
        position: relative;
        overflow: hidden;
        background: linear-gradient(110deg, #6366f1, #7c3aed 55%, #4f46e5);
        background-size: 200% 100%;
        box-shadow:
          0 9px 18px rgba(99, 102, 241, 0.22),
          inset 1px 1px 0 rgba(255, 255, 255, 0.35),
          inset -1px -1px 0 rgba(49, 46, 129, 0.15);
        transition:
          transform 250ms ease,
          box-shadow 250ms ease,
          background-position 500ms ease;
      }

      .neo-primary-button::before {
        content: "";
        position: absolute;
        top: -80%;
        left: -50%;
        width: 35%;
        height: 260%;
        transform: rotate(25deg);
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.24),
          transparent
        );
        transition: left 600ms ease;
        pointer-events: none;
      }

      .neo-primary-button:hover:not(:disabled) {
        transform: translateY(-2px);
        background-position: 100% 0;
        box-shadow:
          0 14px 24px rgba(99, 102, 241, 0.32),
          inset 1px 1px 0 rgba(255, 255, 255, 0.4);
      }

      .neo-primary-button:hover:not(:disabled)::before {
        left: 130%;
      }

      .neo-primary-button:active:not(:disabled) {
        transform: translateY(1px) scale(0.99);
        box-shadow:
          0 3px 7px rgba(99, 102, 241, 0.22),
          inset 2px 2px 5px rgba(49, 46, 129, 0.25);
      }

      .neo-primary-button:focus-visible,
      .neo-topic-card:focus-visible,
      .neo-choice-card:focus-visible,
      .neo-back-button:focus-visible {
        outline: 3px solid rgba(99, 102, 241, 0.55);
        outline-offset: 4px;
      }

      .neo-back-button {
        transition:
          color 200ms ease,
          background 200ms ease,
          transform 200ms ease;
      }

      .neo-back-button:hover {
        color: #4f46e5;
        background: rgba(255, 255, 255, 0.6);
        transform: translateX(-3px);
      }

      .neo-error {
        color: #b91c1c;
        border: 1px solid #fecaca;
        background: linear-gradient(145deg, #fff1f2, #fff7f7);
        box-shadow:
          4px 4px 10px rgba(220, 38, 38, 0.05),
          -4px -4px 10px rgba(255, 255, 255, 0.9);
        animation: neo-error-shake 350ms ease both;
      }

      .neo-enter {
        animation: neo-fade-up 750ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .neo-step-content {
        animation: neo-step-enter 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .neo-stagger {
        animation: neo-item-enter 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes neo-fade-up {
        from {
          opacity: 0;
          transform: translateY(22px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes neo-card-arrive {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes neo-step-enter {
        from {
          opacity: 0;
          transform: translateX(12px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes neo-item-enter {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes neo-float {
        0% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        100% {
          transform: translate3d(24px, -30px, 0) scale(1.08);
        }
      }

      @keyframes neo-shimmer {
        0% {
          transform: translateX(-110%);
        }
        100% {
          transform: translateX(220%);
        }
      }

      @keyframes neo-check-pop {
        0% {
          transform: scale(0.65) rotate(-20deg);
        }
        70% {
          transform: scale(1.16) rotate(6deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      @keyframes neo-glow {
        from {
          opacity: 0.45;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1.15);
        }
      }

      @keyframes neo-error-shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-4px);
        }
        75% {
          transform: translateX(4px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .neo-onboarding *,
        .neo-onboarding *::before,
        .neo-onboarding *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

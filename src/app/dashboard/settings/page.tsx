
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
  Menu,
  Newspaper,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

const INTERESTS = [
  "Technology",
  "Artificial Intelligence",
  "Science",
  "Business",
  "World",
  "Politics",
  "Health",
  "Climate",
  "Startups",
  "Sports",
  "Culture",
  "Education",
] as const;

type Interest = (typeof INTERESTS)[number];
type ReadingDepth = "brief" | "balanced" | "detailed";
type PaperSize = "compact" | "standard" | "extended";

type Preferences = {
  interests: Interest[];
  readingDepth: ReadingDepth;
  paperSize: PaperSize;
  onboardingCompleted: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  interests: [],
  readingDepth: "balanced",
  paperSize: "standard",
  onboardingCompleted: false,
};

const DEPTH_OPTIONS: {
  value: ReadingDepth;
  title: string;
  description: string;
}[] = [
  {
    value: "brief",
    title: "Brief",
    description: "Headlines and concise summaries.",
  },
  {
    value: "balanced",
    title: "Balanced",
    description: "A useful mix of context and brevity.",
  },
  {
    value: "detailed",
    title: "Detailed",
    description: "More context for deeper reading.",
  },
];

const PAPER_OPTIONS: {
  value: PaperSize;
  title: string;
  description: string;
  articles: string;
}[] = [
  {
    value: "compact",
    title: "Compact",
    description: "A quick daily catch-up.",
    articles: "8 stories",
  },
  {
    value: "standard",
    title: "Standard",
    description: "Your everyday newspaper.",
    articles: "18 stories",
  },
  {
    value: "extended",
    title: "Extended",
    description: "More topics to explore.",
    articles: "30 stories",
  },
];

const panelClass =
  "rounded-[26px] border border-white/80 bg-[#eef1f9] shadow-[8px_8px_18px_#d2d7e4,-8px_-8px_18px_#ffffff]";

const insetClass =
  "shadow-[inset_4px_4px_8px_#d2d7e4,inset_-4px_-4px_8px_#ffffff]";

export default function SettingsPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [savedPreferences, setSavedPreferences] =
    useState<Preferences | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPreferences = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/preferences", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your preferences.");
      }

      const loaded: Preferences = {
        interests: Array.isArray(data.preferences?.interests)
          ? data.preferences.interests.filter((item: unknown): item is Interest =>
              INTERESTS.includes(item as Interest),
            )
          : [],
        readingDepth: ["brief", "balanced", "detailed"].includes(
          data.preferences?.readingDepth,
        )
          ? data.preferences.readingDepth
          : "balanced",
        paperSize: ["compact", "standard", "extended"].includes(
          data.preferences?.paperSize,
        )
          ? data.preferences.paperSize
          : "standard",
        onboardingCompleted: Boolean(
          data.preferences?.onboardingCompleted,
        ),
      };

      setPreferences(loaded);
      setSavedPreferences(loaded);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your preferences.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPreferences(controller.signal);

    return () => controller.abort();
  }, [loadPreferences]);

  useEffect(() => {
    if (!sidebarOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  const dirty =
    savedPreferences !== null &&
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  function toggleInterest(interest: Interest) {
    setError("");
    setSuccess("");

    setPreferences((current) => {
      const selected = current.interests.includes(interest);

      if (selected) {
        return {
          ...current,
          interests: current.interests.filter((item) => item !== interest),
        };
      }

      if (current.interests.length >= 4) {
        setError("Choose up to four interests. Remove one to add another.");
        return current;
      }

      return {
        ...current,
        interests: [...current.interests, interest],
      };
    });
  }

  function resetChanges() {
    if (savedPreferences) {
      setPreferences({ ...savedPreferences });
      setError("");
      setSuccess("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (preferences.interests.length < 1) {
      setError("Choose at least one interest.");
      return;
    }

    if (preferences.interests.length > 4) {
      setError("Choose no more than four interests.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: preferences.interests,
          readingDepth: preferences.readingDepth,
          paperSize: preferences.paperSize,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your preferences.");
      }

      const saved: Preferences = {
        interests: data.preferences.interests,
        readingDepth: data.preferences.readingDepth,
        paperSize: data.preferences.paperSize,
        onboardingCompleted: data.preferences.onboardingCompleted,
      };

      setPreferences(saved);
      setSavedPreferences(saved);
      setSuccess(
        "Your preferences have been saved to your account.",
      );
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

      <main className="min-h-screen min-w-0 overflow-x-clip px-3 py-5 sm:px-6 sm:py-8 lg:ml-[272px] lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-7">
          <header className={`${panelClass} p-5 sm:p-8`}>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-indigo-600 transition hover:text-indigo-800 lg:hidden ${panelClass}`}
              >
                <Menu size={21} />
              </button>

              <Link
                href="/dashboard"
                className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
              >
                <ArrowLeft size={16} />
                Back to your paper
              </Link>
            </div>

            <div className="mt-7 flex items-start gap-4">
              <div className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-indigo-600 sm:flex ${panelClass}`}>
                <Settings2 size={26} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Your account · Your choices
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Settings
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Fine-tune your interests and newspaper format. Your saved
                  preferences will guide future personalized news and editions.
                </p>
              </div>
            </div>

            <div className={`mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-600 ${insetClass}`}>
              <Sparkles size={18} className="shrink-0 text-indigo-500" />
              <span>
                {dirty
                  ? "You have unsaved changes."
                  : "Your settings are synced with your Paperly AI account."}
              </span>
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="ml-3 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Settings saved</p>
                <p className="mt-1">{success}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
              <LoaderCircle size={22} className="animate-spin text-indigo-500" />
              Loading your preferences...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Interests */}
              <section className={`${panelClass} p-5 sm:p-8`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                      01 · Personalization
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                      Your interests
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Select the subjects you want your daily newspaper to
                      prioritize.
                    </p>
                  </div>

                  <span className={`rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 ${insetClass}`}>
                    {preferences.interests.length} of 4 selected
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {INTERESTS.map((interest) => {
                    const selected = preferences.interests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest)}
                        className={`flex min-h-[56px] items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          selected
                            ? "border-indigo-300 bg-[#e9eaf7] text-indigo-700 shadow-[inset_4px_4px_8px_#cfd3e4,inset_-4px_-4px_8px_#ffffff]"
                            : "border-white/80 bg-[#eef1f9] text-slate-600 shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff] hover:-translate-y-0.5 hover:text-indigo-700"
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-300 text-transparent"
                        }`}>
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Choose at least one and no more than four interests.
                </p>
              </section>

              {/* Reading depth */}
              <section className={`${panelClass} p-5 sm:p-8`}>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  02 · Reading experience
                </p>
                <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                  Reading depth
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose how much context you prefer with your news.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {DEPTH_OPTIONS.map((option) => {
                    const selected = preferences.readingDepth === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPreferences((current) => ({
                            ...current,
                            readingDepth: option.value,
                          }));
                          setSuccess("");
                        }}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? "border-indigo-300 bg-[#e9eaf7] shadow-[inset_4px_4px_8px_#cfd3e4,inset_-4px_-4px_8px_#ffffff]"
                            : "border-white/80 bg-[#eef1f9] shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff] hover:-translate-y-0.5"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className={`font-extrabold ${selected ? "text-indigo-700" : "text-slate-700"}`}>
                            {option.title}
                          </span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : "border-slate-300"
                          }`}>
                            {selected && <Check size={12} />}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Paper size */}
              <section className={`${panelClass} p-5 sm:p-8`}>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  03 · Daily edition
                </p>
                <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                  Newspaper size
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pick the amount of news you want in your daily paper.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {PAPER_OPTIONS.map((option) => {
                    const selected = preferences.paperSize === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPreferences((current) => ({
                            ...current,
                            paperSize: option.value,
                          }));
                          setSuccess("");
                        }}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? "border-indigo-300 bg-[#e9eaf7] shadow-[inset_4px_4px_8px_#cfd3e4,inset_-4px_-4px_8px_#ffffff]"
                            : "border-white/80 bg-[#eef1f9] shadow-[5px_5px_10px_#d2d7e4,-5px_-5px_10px_#ffffff] hover:-translate-y-0.5"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className={`font-extrabold ${selected ? "text-indigo-700" : "text-slate-700"}`}>
                            {option.title}
                          </span>
                          {selected && (
                            <CheckCircle2 size={19} className="text-indigo-600" />
                          )}
                        </span>

                        <span className="mt-3 block text-2xl font-black text-slate-800">
                          {option.articles}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Save controls */}
              <section className={`${panelClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                <div>
                  <p className="font-bold text-slate-700">
                    Ready to update your paper?
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your changes will be saved to your account.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetChanges}
                    disabled={!dirty || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/80 bg-[#eef1f9] px-4 py-3 text-sm font-bold text-slate-600 shadow-[4px_4px_9px_#d2d7e4,-4px_-4px_9px_#ffffff] transition hover:text-indigo-700 active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Reset changes
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loading || !dirty}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[5px_5px_12px_#d0d5e2,-4px_-4px_10px_#ffffff] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_15px_#d0d5e2,-5px_-5px_12px_#ffffff] active:translate-y-0 active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving changes..." : "Save preferences"}
                  </button>
                </div>
              </section>
            </form>
          )}

          <footer className="pb-3 text-center text-xs text-slate-400">
            <Newspaper size={14} className="mr-1 inline-block" />
            Paperly AI · Your world, your daily paper.
          </footer>
        </div>
      </main>
    </div>
  );
}

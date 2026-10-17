
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Newspaper,
  Sparkles,
} from "lucide-react";

const topics = [
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
];

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
  const responseText = await response.text();
  console.error("Unexpected API response:", response.status, responseText);
  throw new Error(
    `The preferences API returned an unexpected response (HTTP ${response.status}). Check the API route and server terminal.`,
  );
}

const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load preferences.");
        }

        if (!active) return;

        const saved = data.preferences as SavedPreferences | undefined;

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
              : "Unable to load preferences.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
          : "Unable to save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb]">
        <p className="text-sm text-slate-500">
          Preparing your personal paper...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6fb] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-lg font-bold text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Newspaper size={21} />
          </span>
          Paperly <span className="text-indigo-600">AI</span>
        </a>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-9">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={17} />
            CREATE YOUR PERSONAL MORNING PAPER
          </div>

          <div
            className="mt-6 flex gap-2"
            aria-label={`Step ${step} of 2`}
          >
            {[1, 2].map((number) => (
              <div
                key={number}
                className={`h-1.5 flex-1 rounded-full ${
                  number <= step ? "bg-indigo-600" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          {step === 1 ? (
            <>
              <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
                What matters to you?
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Pick up to 4 subjects for your personalized daily paper.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {topics.map((topic) => {
                  const selected = preferences.interests.includes(topic);
                  const limitReached =
                    preferences.interests.length >= 4 && !selected;

                  return (
                    <button
                      key={topic}
                      type="button"
                      disabled={limitReached}
                      onClick={() => toggleTopic(topic)}
                      aria-pressed={selected}
                      className={`flex min-h-14 items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <span>{topic}</span>
                      {selected && <Check size={17} />}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {preferences.interests.length} of 4 topics selected
              </p>

              <button
                type="button"
                onClick={() => {
                  if (preferences.interests.length === 0) {
                    setError("Choose at least one topic.");
                    return;
                  }

                  setError("");
                  setStep(2);
                }}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
              >
                Continue <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
              >
                <ArrowLeft size={16} />
                Back to interests
              </button>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                Your ideal daily paper
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Choose how much detail you would like and how many stories
                to include. You can change these preferences later.
              </p>

              <h2 className="mt-8 font-semibold text-slate-900">
                Reading depth
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["brief", "Quick read", "Short summaries and key facts"],
                    ["balanced", "Balanced", "Context without the overload"],
                    ["detailed", "Deep dive", "More background and detail"],
                  ] as const
                ).map(([value, title, description]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={preferences.readingDepth === value}
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        readingDepth: value,
                      }))
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      preferences.readingDepth === value
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <span className="block font-semibold text-slate-900">
                      {title}
                    </span>

                    <span className="mt-2 block text-xs leading-5 text-slate-500">
                      {description}
                    </span>
                  </button>
                ))}
              </div>

              <h2 className="mt-8 font-semibold text-slate-900">
                Daily paper size
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["compact", "Compact", "A few essential stories"],
                    ["standard", "Standard", "A balanced daily edition"],
                    ["extended", "Extended", "More topics and coverage"],
                  ] as const
                ).map(([value, title, description]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={preferences.paperSize === value}
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        paperSize: value,
                      }))
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      preferences.paperSize === value
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <span className="block font-semibold text-slate-900">
                      {title}
                    </span>

                    <span className="mt-2 block text-xs leading-5 text-slate-500">
                      {description}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={savePreferences}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving your preferences..." : "Create my paper"}
                {!saving && <Sparkles size={18} />}
              </button>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Your choices help Paperly personalize future editions. You can
          update them later.
        </p>
      </div>
    </main>
  );
}

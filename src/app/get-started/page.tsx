
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Newspaper,
  Sparkles,
  UserRound,
  Bookmark,
  BrainCircuit,
} from "lucide-react";

const inputClass =
  "w-full rounded-2xl border border-white/70 bg-[#e9eaf2] px-4 py-3.5 text-sm text-slate-700 shadow-[inset_4px_4px_8px_#c9cad1,inset_-4px_-4px_8px_#ffffff] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:shadow-[inset_2px_2px_5px_#c9cad1,inset_-2px_-2px_5px_#ffffff,0_0_0_3px_rgba(99,102,241,0.12)]";

const raisedClass =
  "border border-white/70 bg-[#e9eaf2] shadow-[6px_6px_12px_#c9cad1,-6px_-6px_12px_#ffffff]";

export default function GetStartedPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to create your account. Please try again.",
        );
      }

      router.push("/login?registered=true");
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e9eaf2] px-4 py-6 text-slate-800 sm:px-6 sm:py-10">
      {/* Soft neumorphic background decorations */}
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full border border-white/60 bg-[#e9eaf2] shadow-[18px_18px_36px_#c9cad1,-18px_-18px_36px_#ffffff] opacity-50" />
      <div className="pointer-events-none absolute -bottom-36 -right-24 h-80 w-80 rounded-full border border-white/60 bg-[#e9eaf2] shadow-[18px_18px_36px_#c9cad1,-18px_-18px_36px_#ffffff] opacity-60" />

      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${raisedClass} text-indigo-600`}
            >
              <Newspaper size={23} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight sm:text-2xl">
                Paperly <span className="text-indigo-600">AI</span>
              </span>
              <span className="block text-[9px] font-bold tracking-[0.22em] text-slate-500 sm:text-[10px]">
                YOUR DAILY INTELLIGENCE
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:text-indigo-600 sm:px-4 sm:text-sm ${raisedClass}`}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </header>

        <div className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:py-16">
          {/* Brand introduction */}
          <section className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#e9eaf2] px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-[4px_4px_8px_#c9cad1,-4px_-4px_8px_#ffffff]">
              <Sparkles size={15} />
              Your daily paper starts here
            </div>

            <h1 className="text-4xl font-black leading-[1.13] tracking-tight text-slate-800 sm:text-5xl xl:text-6xl">
              Your interests.
              <br />
              Your news.
              <br />
              <span className="text-indigo-600">Your daily paper.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              Create your account and discover a personalized newspaper with
              curated stories, AI-powered briefings, and editions you can save
              and revisit.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Personalized news",
                  Icon: Newspaper,
                },
                {
                  label: "AI summaries",
                  Icon: BrainCircuit,
                },
                {
                  label: "Saved editions",
                  Icon: Bookmark,
                },
              ].map(({ label, Icon }) => (
                <div key={label} className="text-center">
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-indigo-600 transition-transform hover:-translate-y-1 sm:h-[76px] sm:w-[76px] ${raisedClass}`}
                  >
                    <Icon size={25} strokeWidth={1.8} />
                  </div>
                  <p className="mx-auto mt-3 max-w-24 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Signup form */}
          <section
            className="mx-auto w-full max-w-lg rounded-[30px] border border-white/70 bg-[#e9eaf2] p-5 shadow-[14px_14px_30px_#c9cad1,-14px_-14px_30px_#ffffff] sm:p-8 md:p-9"
          >
            <div className="mb-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-indigo-600 shadow-[inset_5px_5px_10px_#c9cad1,inset_-5px_-5px_10px_#ffffff]">
                <Sparkles size={25} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Get started for free
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your personalized daily newspaper starts here.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-slate-600"
                  >
                    First name
                  </label>
                  <div className="relative">
                    <UserRound
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="firstName"
                      required
                      autoComplete="given-name"
                      maxLength={80}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className={`${inputClass} pl-10 pr-3`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-slate-600"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    autoComplete="family-name"
                    maxLength={80}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputClass} pl-10 pr-3`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your password again"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-400/30 bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-4 text-sm font-bold text-white shadow-[6px_6px_12px_#c9cad1,-5px_-5px_10px_#ffffff] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#c9cad1,-6px_-6px_12px_#ffffff] active:translate-y-0 active:shadow-inner disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-300/80" />
              <span className="text-xs font-medium text-slate-400">
                YOUR NEWS, YOUR WAY
              </span>
              <div className="h-px flex-1 bg-slate-300/80" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 transition hover:text-violet-700"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to use Paperly AI responsibly.
            </p>
          </section>
        </div>

        <footer className="pb-3 text-center text-xs text-slate-400">
          Made for curious minds · Paperly AI
        </footer>
      </div>
    </main>
  );
}

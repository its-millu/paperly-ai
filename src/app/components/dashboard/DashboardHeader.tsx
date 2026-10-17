
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Check,
  Clock3,
  Compass,
  FileText,
  Menu,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

type Reader = {
  name?: string;
  email?: string;
};

const notificationLinks = [
  {
    title: "Discover new stories",
    description: "Explore your personalized news feed.",
    href: "/dashboard/discover",
    icon: Compass,
  },
  {
    title: "Continue reading",
    description: "Revisit your recently read articles.",
    href: "/dashboard/history",
    icon: Clock3,
  },
  {
    title: "Your daily edition",
    description: "Open today's personalized newspaper.",
    href: "/dashboard/edition",
    icon: FileText,
  },
];

export default function DashboardHeader({ onMenuClick }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [reader, setReader] = useState<Reader | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Load the authenticated NextAuth session without requiring useSession().
  useEffect(() => {
    let cancelled = false;

    async function loadReader() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const session = await response.json();

        if (cancelled) return;

        if (session?.user) {
          setReader({
            name:
              typeof session.user.name === "string"
                ? session.user.name
                : undefined,
            email:
              typeof session.user.email === "string"
                ? session.user.email
                : undefined,
          });
        }
      } catch (error) {
        console.error("Unable to load reader session:", error);
      } finally {
        if (!cancelled) setAccountLoading(false);
      }
    }

    void loadReader();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the notification dropdown when clicking outside it.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Keep the search box synchronized with the Discover URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
  }, [pathname]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) {
      router.push("/dashboard/discover");
      return;
    }

    router.push(
      `/dashboard/discover?q=${encodeURIComponent(searchTerm)}`,
    );
  }

  const displayName =
    reader?.name?.trim() ||
    reader?.email?.split("@")[0] ||
    (accountLoading ? "Loading account..." : "Reader account");

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "P";

  return (
    <header className="paperly-header relative z-30 flex min-h-[76px] items-center gap-3 rounded-[1.5rem] px-3 py-3 sm:gap-4 sm:px-5 lg:px-6">
      {/* Mobile navigation */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="paperly-header-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600 lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Functional search */}
      <form
        role="search"
        onSubmit={handleSearch}
        className="paperly-header-search relative min-w-0 max-w-2xl flex-1 rounded-2xl"
      >
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stories, topics, and sources..."
          aria-label="Search stories"
          className="paperly-header-input h-12 w-full rounded-2xl py-3 pl-11 pr-10 text-sm text-slate-700 placeholder:text-slate-400"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Notifications dropdown */}
      <div ref={notificationRef} className="relative shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          aria-haspopup="true"
          title="Notifications"
          onClick={() => setNotificationsOpen((open) => !open)}
          className="paperly-header-icon relative flex h-11 w-11 items-center justify-center rounded-2xl text-slate-600"
        >
          <Bell size={19} />

          {!notificationsOpen && (
            <span
              aria-hidden="true"
              className="paperly-notification-dot absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
            />
          )}
        </button>

        {notificationsOpen && (
          <div
            role="dialog"
            aria-label="Quick links and updates"
            className="paperly-notification-panel absolute right-0 top-[calc(100%+14px)] z-50 w-[min(340px,calc(100vw-2rem))] rounded-3xl p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">
                  Your reading hub
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Quick links for your daily paper
                </p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <Sparkles size={17} />
              </span>
            </div>

            <div className="space-y-2">
              {notificationLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setNotificationsOpen(false)}
                    className="paperly-notification-link flex items-start gap-3 rounded-2xl p-3"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm">
                      <Icon size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-700">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5 text-xs text-slate-500">
              <Check size={14} className="shrink-0 text-emerald-500" />
              <span>You're all caught up on these quick links.</span>
            </div>
          </div>
        )}
      </div>

      {/* Authenticated reader account */}
      <Link
        href="/dashboard/settings"
        aria-label="Open account settings"
        title="Account settings"
        className="paperly-account flex min-w-0 shrink-0 items-center gap-3 rounded-2xl py-1 pl-2 pr-1 sm:ml-1 sm:pl-3 sm:pr-3"
      >
        <div className="paperly-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold">
          {initials}
        </div>

        <div className="hidden min-w-0 xl:block">
          <p className="max-w-[150px] truncate text-sm font-bold text-slate-800">
            {displayName}
          </p>
          <p className="mt-0.5 max-w-[150px] truncate text-xs text-slate-500">
            {reader?.email || "Personal edition"}
          </p>
        </div>

        <Settings
          size={15}
          aria-hidden="true"
          className="hidden shrink-0 text-indigo-400 xl:block"
        />
      </Link>

      <style jsx global>{`
        .paperly-header {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f6f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d4d9e6,
            -8px -8px 18px #ffffff,
            inset 1px 1px 0 rgba(255, 255, 255, 0.9);
          animation: paperly-header-enter 550ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .paperly-header-search {
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: #eef1f9;
          box-shadow:
            inset 4px 4px 8px #d5dae7,
            inset -4px -4px 8px #ffffff;
          transition:
            box-shadow 250ms ease,
            border-color 250ms ease;
        }

        .paperly-header-search:focus-within {
          border-color: rgba(129, 140, 248, 0.7);
          box-shadow:
            inset 3px 3px 6px #d5dae7,
            inset -3px -3px 6px #ffffff,
            0 0 0 3px rgba(129, 140, 248, 0.12);
        }

        .paperly-header-input {
          border: 0;
          outline: none;
          background: transparent;
        }

        .paperly-header-input::-webkit-search-cancel-button {
          cursor: pointer;
        }

        .paperly-header-icon {
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f7f8ff, #e9edf8);
          box-shadow:
            5px 5px 10px #d5dae7,
            -5px -5px 10px #ffffff;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            color 220ms ease;
        }

        .paperly-header-icon:hover {
          color: #6366f1;
          transform: translateY(-2px);
          box-shadow:
            7px 7px 13px #d0d6e4,
            -6px -6px 12px #ffffff;
        }

        .paperly-header-icon:active {
          transform: scale(0.95);
          box-shadow:
            inset 3px 3px 6px #d5dae7,
            inset -3px -3px 6px #ffffff;
        }

        .paperly-notification-dot {
          border: 2px solid #eef1f9;
          background: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.12);
        }

        .paperly-notification-panel {
          border: 1px solid rgba(255, 255, 255, 0.95);
          background: linear-gradient(145deg, #f6f8ff, #edf0f9);
          box-shadow:
            12px 12px 26px rgba(180, 187, 204, 0.65),
            -8px -8px 22px rgba(255, 255, 255, 0.95);
          animation: paperly-dropdown-enter 180ms ease-out both;
        }

        .paperly-notification-link {
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .paperly-notification-link:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: translateX(2px);
        }

        .paperly-account {
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: linear-gradient(145deg, #f6f8ff, #edf0f9);
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .paperly-account:hover {
          transform: translateY(-1px);
          box-shadow:
            5px 5px 10px #d5dae7,
            -5px -5px 10px #ffffff;
        }

        .paperly-avatar {
          color: #5b5fc7;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f2f3ff, #e1e5fb);
          box-shadow:
            4px 4px 8px #d4d9e6,
            -4px -4px 8px #ffffff;
        }

        .paperly-header button:focus-visible,
        .paperly-header a:focus-visible,
        .paperly-header input:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.7);
          outline-offset: 3px;
        }

        @keyframes paperly-header-enter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes paperly-dropdown-enter {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-header *,
          .paperly-header *::before,
          .paperly-header *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </header>
  );
}

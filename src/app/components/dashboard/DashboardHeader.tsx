
"use client";

import { Bell, Menu, Search, Sparkles } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function DashboardHeader({ onMenuClick }: Props) {
  return (
    <header className="paperly-header flex min-h-[76px] items-center gap-3 rounded-[1.5rem] px-3 py-3 sm:gap-4 sm:px-5 lg:px-6">
      {/* Mobile navigation */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="paperly-header-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600 lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Search */}
      <form
        role="search"
        className="paperly-header-search relative min-w-0 max-w-2xl flex-1 rounded-2xl"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          placeholder="Search stories, topics, and sources..."
          aria-label="Search stories"
          className="paperly-header-input h-12 w-full rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
        />
      </form>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        className="paperly-header-icon relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600"
      >
        <Bell size={19} />
        <span
          aria-label="Notification indicator"
          className="paperly-notification-dot absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
        />
      </button>

      {/* Account */}
      <div className="paperly-account flex shrink-0 items-center gap-3 rounded-2xl py-1 pl-2 pr-1 sm:ml-1 sm:pl-3 sm:pr-3">
        <div className="paperly-avatar flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold">
          P
        </div>

        <div className="hidden min-w-0 xl:block">
          <p className="text-sm font-bold text-slate-800">
            Reader account
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Personal edition
          </p>
        </div>

        <Sparkles
          size={15}
          aria-hidden="true"
          className="hidden text-indigo-400 xl:block"
        />
      </div>

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
          animation: paperly-notification-pulse 2.4s ease-in-out infinite;
        }

        .paperly-account {
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: linear-gradient(145deg, #f6f8ff, #edf0f9);
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .paperly-avatar {
          color: #5b5fc7;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(145deg, #f2f3ff, #e1e5fb);
          box-shadow:
            4px 4px 8px #d4d9e6,
            -4px -4px 8px #ffffff;
          transition: transform 300ms ease;
        }

        .paperly-account:hover .paperly-avatar {
          transform: rotate(-7deg) scale(1.05);
        }

        .paperly-header button:focus-visible,
        .paperly-header input:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.6);
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

        @keyframes paperly-notification-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.12);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(129, 140, 248, 0.05);
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


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Clock3,
  Compass,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  X,
  ArrowUpRight,
} from "lucide-react";
import { History } from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/dashboard/discover", icon: Compass },
  { label: "Daily Editions", href: "/dashboard/edition", icon: FileText },
  { label: "Previous Day", href: "/dashboard/previous-editions", icon: History },
  { label: "Saved Articles", href: "/dashboard/saved", icon: Bookmark },
  { label: "Reading History", href: "/dashboard/history", icon: Clock3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DashboardSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="paperly-sidebar-backdrop fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      
<aside
  aria-label="Main navigation"
  className={`paperly-sidebar fixed inset-y-0 left-0 z-50 box-border flex h-dvh max-h-dvh w-[272px] max-w-[85vw] flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain p-5 sm:p-6 transition-transform duration-300 ease-out ${
    open ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0`}
>

        {/* Brand */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span className="paperly-brand-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={22} strokeWidth={2.1} />
            </span>

            <span className="min-w-0">
              <span className="block text-[21px] font-extrabold tracking-tight text-slate-800">
                Paperly<span className="text-indigo-600"> AI</span>
              </span>
              <span className="block text-[11px] font-medium tracking-wide text-slate-500">
                YOUR DAILY INTELLIGENCE
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="paperly-icon-button rounded-xl p-2 text-slate-500 transition lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace navigation */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Workspace
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.65)]" />
          </div>

          <nav aria-label="Workspace" className="space-y-2">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`paperly-nav-item group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    active
                      ? "paperly-nav-active text-indigo-700"
                      : "text-slate-600 hover:text-indigo-700"
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-indigo-500" />
                  )}

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      active
                        ? "paperly-nav-icon-active text-indigo-600"
                        : "text-slate-500 group-hover:text-indigo-600"
                    }`}
                  >
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                  </span>

                  <span className="flex-1">{label}</span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI briefing card */}
        <div className="mt-auto pt-6">
          <div className="paperly-briefing-card relative overflow-hidden rounded-[24px] p-4">
            <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-indigo-200/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-violet-200/30 blur-2xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <span className="paperly-briefing-icon flex h-10 w-10 items-center justify-center rounded-2xl text-indigo-600">
                  <Sparkles size={19} />
                </span>
                <span className="rounded-full border border-white/70 bg-white/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                  AI powered
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800">
                Your AI briefing
              </h3>

              <p className="mt-2 text-xs leading-[1.7] text-slate-600">
                Turn the noise into knowledge with a personalized daily edition.
              </p>

              <Link
                href="/dashboard/discover"
                onClick={onClose}
                className="paperly-briefing-link mt-4 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold text-indigo-700 transition-all duration-200"
              >
                Read News
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-slate-400">
            MADE FOR CURIOUS MINDS
          </p>
        </div>
      </aside>

      <style jsx global>{`
        .paperly-sidebar {
          background: linear-gradient(155deg, #f6f7fd 0%, #eef1fa 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow:
            10px 0 28px rgba(191, 198, 218, 0.12),
            inset -1px 0 0 rgba(211, 216, 231, 0.5);
        }

        .paperly-brand-icon {
          background: linear-gradient(145deg, #818cf8, #5b5bd6);
          box-shadow:
            5px 5px 12px rgba(177, 182, 222, 0.8),
            -4px -4px 10px rgba(255, 255, 255, 0.95),
            inset 1px 1px 2px rgba(255, 255, 255, 0.4);
        }

        .paperly-icon-button {
          background: linear-gradient(145deg, #f8f9ff, #e9ecf6);
          box-shadow:
            3px 3px 7px #d5d9e6,
            -3px -3px 7px #ffffff;
        }

        .paperly-icon-button:hover {
          box-shadow:
            inset 2px 2px 5px #d5d9e6,
            inset -2px -2px 5px #ffffff;
        }

        .paperly-nav-item {
          background: transparent;
          border: 1px solid transparent;
        }

        .paperly-nav-item:not(.paperly-nav-active):hover {
          background: linear-gradient(145deg, #f7f8ff, #edf0f9);
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow:
            4px 4px 9px rgba(204, 210, 228, 0.75),
            -4px -4px 9px rgba(255, 255, 255, 0.9);
          transform: translateX(2px);
        }

        .paperly-nav-active {
          background: linear-gradient(145deg, #f8f9ff, #e9edfa);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            inset 3px 3px 7px rgba(203, 209, 229, 0.8),
            inset -3px -3px 7px rgba(255, 255, 255, 0.95);
        }

        .paperly-nav-icon-active {
          background: linear-gradient(145deg, #f5f6ff, #e7eafd);
          box-shadow:
            2px 2px 5px rgba(202, 208, 229, 0.75),
            -2px -2px 5px rgba(255, 255, 255, 0.9);
        }

        .paperly-briefing-card {
          background: linear-gradient(145deg, #f7f8ff, #e9edf9);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            7px 7px 16px rgba(203, 209, 228, 0.75),
            -7px -7px 16px rgba(255, 255, 255, 0.95);
        }

        .paperly-briefing-icon {
          background: linear-gradient(145deg, #f8f9ff, #e8ebfa);
          box-shadow:
            4px 4px 8px rgba(203, 209, 228, 0.7),
            -4px -4px 8px rgba(255, 255, 255, 0.95);
        }

        .paperly-briefing-link {
          background: linear-gradient(145deg, #f8f9ff, #e9edfa);
          box-shadow:
            3px 3px 7px rgba(203, 209, 228, 0.75),
            -3px -3px 7px rgba(255, 255, 255, 0.95);
        }

        .paperly-briefing-link:hover {
          box-shadow:
            inset 2px 2px 5px rgba(203, 209, 228, 0.85),
            inset -2px -2px 5px rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
        }

        .paperly-sidebar-backdrop {
          animation: paperly-backdrop-in 180ms ease-out both;
        }

        @keyframes paperly-backdrop-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-sidebar,
          .paperly-nav-item,
          .paperly-icon-button,
          .paperly-briefing-link {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}


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
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/dashboard/discover", icon: Compass },
  { label: "My Briefing", href: "/dashboard/briefing", icon: FileText },
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
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-[#f7f8fc] p-5 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Sparkles size={21} />
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight text-slate-900">
                Paperly<span className="text-indigo-600"> AI</span>
              </span>
              <span className="text-xs text-slate-500">Your daily intelligence</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-10">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600">
            <Sparkles size={18} />
          </div>
          <p className="font-semibold text-slate-900">Your AI briefing</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Turn the noise into knowledge with a personalized daily edition.
          </p>
          <Link
            href="/dashboard/briefing"
            className="mt-3 inline-block text-sm font-semibold text-indigo-600"
          >
            Explore briefing →
          </Link>
        </div>
      </aside>
    </>
  );
}

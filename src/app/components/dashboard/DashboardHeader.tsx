
"use client";

import { Bell, Menu, Search } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function DashboardHeader({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="relative max-w-xl flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search stories, topics, and sources..."
          aria-label="Search stories"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      <button
        aria-label="Notifications"
        className="relative rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
      >
        <Bell size={19} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
      </button>

      <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 font-bold text-indigo-700">
          P
        </div>
        <div className="hidden xl:block">
          <p className="text-sm font-semibold text-slate-900">Reader account</p>
          <p className="text-xs text-slate-500">Personal edition</p>
        </div>
      </div>
    </header>
  );
}

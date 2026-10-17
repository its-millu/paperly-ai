
"use client";

import { useState } from "react";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardContent from "@/app/components/dashboard/DashboardContent";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="neo-dashboard relative min-h-screen overflow-x-clip bg-[#eef1f9] text-slate-800">
      {/* Ambient animated background */}
      <div
        className="neo-dashboard-orb neo-dashboard-orb-one"
        aria-hidden="true"
      />
      <div
        className="neo-dashboard-orb neo-dashboard-orb-two"
        aria-hidden="true"
      />
      <div className="neo-dashboard-pattern" aria-hidden="true" />

      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content: reserve exactly the sidebar width on desktop */}
      <div className="relative z-10 min-h-screen min-w-0 lg:ml-[272px]">
        <div className="neo-dashboard-header-wrap sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-5 lg:px-7">
          <DashboardHeader
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="neo-dashboard-main min-w-0 w-full px-3 pb-8 pt-5 sm:px-5 sm:pt-7 lg:px-7 lg:pb-12">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">
            <DashboardContent />
          </div>
        </main>

        <footer className="px-5 pb-7 text-center text-xs text-slate-400">
          <span className="font-semibold text-indigo-500">
            Paperly AI
          </span>
          <span className="mx-2">·</span>
          Your world. Your daily paper.
        </footer>
      </div>

      <style jsx global>{`
        .neo-dashboard {
          isolation: isolate;
          --dashboard-bg: #eef1f9;
          --dashboard-shadow: #d0d5e2;
          --dashboard-light: #ffffff;
          --dashboard-indigo: #6366f1;
        }

        .neo-dashboard-pattern {
          position: absolute;
          z-index: -1;
          inset: 0;
          pointer-events: none;
          opacity: 0.2;
          background-image: radial-gradient(
            #9da8c2 0.7px,
            transparent 0.7px
          );
          background-size: 23px 23px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 80%
          );
        }

        .neo-dashboard-orb {
          position: absolute;
          z-index: -1;
          border-radius: 9999px;
          pointer-events: none;
          filter: blur(3px);
          opacity: 0.55;
          animation: neo-dashboard-float 16s ease-in-out infinite alternate;
        }

        .neo-dashboard-orb-one {
          top: 80px;
          left: -150px;
          width: 340px;
          height: 340px;
          background: radial-gradient(
            circle at 35% 35%,
            #d8dcff,
            #e8eaff 50%,
            transparent 72%
          );
        }

        .neo-dashboard-orb-two {
          top: 450px;
          right: -190px;
          width: 420px;
          height: 420px;
          animation-delay: -7s;
          background: radial-gradient(
            circle at 35% 35%,
            #d9e9ff,
            #e8efff 50%,
            transparent 72%
          );
        }

        .neo-dashboard-header-wrap {
          background: linear-gradient(
            180deg,
            rgba(238, 241, 249, 0.96),
            rgba(238, 241, 249, 0.76)
          );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          animation: neo-dashboard-enter 500ms ease both;
        }

        .neo-dashboard-main {
          animation: neo-dashboard-enter
            650ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Shared neumorphic surfaces */
        .neo-surface {
          border: 1px solid rgba(255, 255, 255, 0.85);
          background: linear-gradient(145deg, #f6f8ff, #edf0f9);
          box-shadow:
            8px 8px 18px #d5dae7,
            -8px -8px 18px #ffffff,
            inset 1px 1px 0 rgba(255, 255, 255, 0.85);
          transition:
            transform 250ms ease,
            box-shadow 250ms ease;
        }

        .neo-surface-interactive:hover {
          transform: translateY(-3px);
          box-shadow:
            11px 12px 22px #d0d6e4,
            -9px -9px 20px #ffffff,
            inset 1px 1px 0 rgba(255, 255, 255, 0.9);
        }

        .neo-inset {
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: #eef1f9;
          box-shadow:
            inset 4px 4px 9px #d3d8e5,
            inset -4px -4px 9px #ffffff;
        }

        .neo-dashboard-button {
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: linear-gradient(110deg, #6366f1, #7c3aed);
          color: #ffffff;
          box-shadow:
            0 7px 16px rgba(99, 102, 241, 0.2),
            inset 1px 1px 0 rgba(255, 255, 255, 0.3);
          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .neo-dashboard-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 11px 22px rgba(99, 102, 241, 0.3),
            inset 1px 1px 0 rgba(255, 255, 255, 0.35);
        }

        .neo-dashboard-button:active {
          transform: scale(0.98);
        }

        .neo-dashboard button:focus-visible,
        .neo-dashboard a:focus-visible,
        .neo-dashboard input:focus-visible,
        .neo-dashboard select:focus-visible {
          outline: 3px solid rgba(99, 102, 241, 0.55);
          outline-offset: 3px;
        }

        @keyframes neo-dashboard-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes neo-dashboard-float {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(25px, -28px, 0) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .neo-dashboard *,
          .neo-dashboard *::before,
          .neo-dashboard *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

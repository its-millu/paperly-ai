
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type Props = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  color: string;
};

export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  color,
}: Props) {
  return (
    <article className="paperly-stat-card group relative overflow-hidden rounded-[24px] p-5 sm:p-6">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-200/25 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-[34px]">
            {value}
          </p>
        </div>

        <span
          className={`paperly-stat-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${color}`}
        >
          <Icon size={22} strokeWidth={1.9} />
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-2">
        <span className="paperly-stat-trend flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-emerald-600">
          <ArrowUpRight size={15} strokeWidth={2.4} />
        </span>

        <p className="text-xs font-medium leading-5 text-slate-500">
          {detail}
        </p>
      </div>

      <style jsx global>{`
        .paperly-stat-card {
          background: linear-gradient(145deg, #f8f9ff 0%, #edf0f9 100%);
          border: 1px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            7px 7px 16px rgba(202, 208, 226, 0.72),
            -7px -7px 16px rgba(255, 255, 255, 0.96);
          transition:
            transform 250ms ease,
            box-shadow 250ms ease;
        }

        .paperly-stat-card:hover {
          transform: translateY(-4px);
          box-shadow:
            10px 12px 22px rgba(194, 201, 222, 0.75),
            -8px -8px 18px rgba(255, 255, 255, 0.98);
        }

        .paperly-stat-icon {
          background: linear-gradient(145deg, #f8f9ff, #e9edf8);
          box-shadow:
            4px 4px 9px rgba(201, 207, 226, 0.8),
            -4px -4px 9px rgba(255, 255, 255, 0.95);
        }

        .paperly-stat-trend {
          background: linear-gradient(145deg, #f7fff9, #e5f5eb);
          box-shadow:
            2px 2px 5px rgba(198, 218, 205, 0.7),
            -2px -2px 5px rgba(255, 255, 255, 0.95);
        }

        @media (prefers-reduced-motion: reduce) {
          .paperly-stat-card,
          .paperly-stat-icon {
            transition: none !important;
          }

          .paperly-stat-card:hover {
            transform: none;
          }
        }
      `}</style>
    </article>
  );
}

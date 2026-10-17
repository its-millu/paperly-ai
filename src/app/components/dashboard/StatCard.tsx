
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
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <ArrowUpRight size={15} className="text-emerald-600" />
        {detail}
      </div>
    </article>
  );
}

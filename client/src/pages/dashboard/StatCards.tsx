import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { AlertIcon, CheckIcon, DealsIcon, TasksIcon, UsersIcon } from '../../components/ui/icons';
import { Skeleton } from '../../components/ui/states';
import { formatMoney, formatMoneyCompact } from '../../lib/format';
import type { Dashboard } from '../../lib/types';

interface Stat {
  label: string;
  value: string;
  sub: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  danger?: boolean;
}

function buildStats(d: Dashboard): Stat[] {
  return [
    {
      label: 'Open pipeline',
      value: formatMoneyCompact(d.openPipelineValue),
      sub: `${d.openDeals} open ${d.openDeals === 1 ? 'deal' : 'deals'} · ${formatMoney(d.openPipelineValue)}`,
      to: '/deals',
      icon: DealsIcon,
    },
    { label: 'Customers', value: String(d.totalCustomers), sub: 'Total customers', to: '/customers', icon: UsersIcon },
    {
      label: 'Won this month',
      value: String(d.dealsWonThisMonth.count),
      sub: formatMoney(d.dealsWonThisMonth.value),
      to: '/deals?view=list&stage=won',
      icon: CheckIcon,
    },
    { label: 'Due today', value: String(d.tasksDueToday), sub: 'Open tasks due today', to: '/tasks?status=today', icon: TasksIcon },
    {
      label: 'Overdue',
      value: String(d.overdueTasks),
      sub: d.overdueTasks ? 'Tasks past their due date' : 'Nothing overdue',
      to: '/tasks?status=overdue',
      icon: AlertIcon,
      danger: d.overdueTasks > 0,
    },
  ];
}

/** Five KPI cards; the first one uses the indigo accent like the design's highlight card. */
export function StatCards({ data }: { data: Dashboard | undefined }) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-busy="true" aria-label="Loading stats">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`card p-4 ${i === 0 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {buildStats(data).map((s, i) => {
        const accent = i === 0;
        const Icon = s.icon;
        return (
          <Link
            key={s.label}
            to={s.to}
            className={`group rounded-card p-4 transition-shadow hover:shadow-lg ${
              accent ? 'col-span-2 bg-primary text-white shadow-lg shadow-primary/25 lg:col-span-1' : 'card'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? 'text-white/80' : 'text-muted'}`}>{s.label}</p>
              <span
                className={`flex size-8 items-center justify-center rounded-lg ${
                  accent ? 'bg-white/15' : s.danger ? 'bg-danger-50 text-danger' : 'bg-primary-50 text-primary'
                }`}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${s.danger ? 'text-danger' : ''}`}>{s.value}</p>
            <p className={`mt-0.5 truncate text-xs ${accent ? 'text-white/80' : 'text-muted'}`}>{s.sub}</p>
          </Link>
        );
      })}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { StageBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/states';
import { formatDate, formatMoney } from '../../lib/format';
import { dealsApi, refId, refName } from '../../lib/resources';
import { useFetch } from '../../lib/useFetch';
import { Widget } from './Widget';

/** The five most recently updated deals. `version` changes force a reload. */
export function RecentDeals({ version }: { version: number }) {
  const { data, error, reload } = useFetch(`recent-deals:${version}`, (signal) => dealsApi.list({ limit: 5 }, signal));

  return (
    <Widget title="Recent Deals" viewAll="/deals?view=list">
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <ListSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No deals yet" message="Deals you add will show up here." />
      ) : (
        <ul className="divide-y divide-line">
          {data.items.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{d.title}</p>
                <p className="truncate text-xs text-muted">
                  {refName(d.customer) ? (
                    <Link to={`/customers/${refId(d.customer)}`} className="hover:text-primary">
                      {refName(d.customer)}
                    </Link>
                  ) : (
                    '—'
                  )}
                  {d.expectedCloseDate && ` · closes ${formatDate(d.expectedCloseDate)}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold tabular-nums">{formatMoney(d.value)}</span>
                <StageBadge stage={d.stage} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}

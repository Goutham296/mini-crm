import { Link } from 'react-router-dom';
import { StageBadge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { EditIcon, TrashIcon } from '../../components/ui/icons';
import { formatDate, formatMoney } from '../../lib/format';
import { refId, refName } from '../../lib/resources';
import type { Deal } from '../../lib/types';

interface DealListProps {
  deals: Deal[];
  onEdit: (d: Deal) => void;
  onDelete: (d: Deal) => void;
  /** Hide the customer column (e.g. on the customer's own page). */
  hideCustomer?: boolean;
}

function Actions({ deal, onEdit, onDelete }: { deal: Deal } & Pick<DealListProps, 'onEdit' | 'onDelete'>) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton label={`Edit ${deal.title}`} onClick={() => onEdit(deal)}>
        <EditIcon className="size-4" />
      </IconButton>
      <IconButton label={`Delete ${deal.title}`} tone="danger" onClick={() => onDelete(deal)}>
        <TrashIcon className="size-4" />
      </IconButton>
    </div>
  );
}

function CustomerLink({ deal }: { deal: Deal }) {
  const name = refName(deal.customer);
  if (!name) return <span className="text-muted">—</span>;
  return (
    <Link to={`/customers/${refId(deal.customer)}`} className="text-muted hover:text-primary hover:underline">
      {name}
    </Link>
  );
}

export function DealList({ deals, onEdit, onDelete, hideCustomer }: DealListProps) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs font-semibold uppercase tracking-wide text-muted">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-semibold">Deal</th>
            {!hideCustomer && <th className="px-4 py-3 font-semibold">Customer</th>}
            <th className="px-4 py-3 font-semibold">Stage</th>
            <th className="px-4 py-3 text-right font-semibold">Value</th>
            <th className="px-4 py-3 font-semibold">Expected close</th>
            <th className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {deals.map((d) => (
            <tr key={d.id} className="hover:bg-canvas/60">
              <td className="px-4 py-3 font-semibold">{d.title}</td>
              {!hideCustomer && (
                <td className="px-4 py-3">
                  <CustomerLink deal={d} />
                </td>
              )}
              <td className="px-4 py-3">
                <StageBadge stage={d.stage} />
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(d.value)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(d.expectedCloseDate)}</td>
              <td className="px-4 py-3">
                <Actions deal={d} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {deals.map((d) => (
          <li key={d.id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold break-words">{d.title}</p>
              {!hideCustomer && (
                <p className="truncate text-xs">
                  <CustomerLink deal={d} />
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <StageBadge stage={d.stage} />
                <span className="font-semibold tabular-nums">{formatMoney(d.value)}</span>
                {d.expectedCloseDate && <span className="text-xs text-muted">· {formatDate(d.expectedCloseDate)}</span>}
              </div>
            </div>
            <Actions deal={d} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
}

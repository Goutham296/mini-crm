import type { HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { IconButton } from '../../components/ui/Button';
import { EditIcon, GripIcon, TrashIcon } from '../../components/ui/icons';
import { DEAL_STAGES } from '../../lib/constants';
import { formatDate, formatMoney } from '../../lib/format';
import { refId, refName } from '../../lib/resources';
import type { Deal, DealStage } from '../../lib/types';

interface DealCardProps {
  deal: Deal;
  onEdit?: (d: Deal) => void;
  onDelete?: (d: Deal) => void;
  onStageChange?: (d: Deal, stage: DealStage) => void;
  /** Drag handle props from dnd-kit (desktop only). */
  handleProps?: HTMLAttributes<HTMLButtonElement>;
  dragging?: boolean;
  overlay?: boolean;
}

/** One deal on the pipeline board. */
export function DealCard({ deal, onEdit, onDelete, onStageChange, handleProps, dragging, overlay }: DealCardProps) {
  const customer = refName(deal.customer);
  return (
    <article
      className={`card p-3 transition-shadow ${dragging ? 'opacity-40' : ''} ${overlay ? 'rotate-1 shadow-xl ring-primary/40' : ''}`}
    >
      <div className="flex items-start gap-2">
        {handleProps && (
          <button
            type="button"
            aria-label={`Drag ${deal.title} to another stage`}
            className="-ml-1 mt-0.5 hidden cursor-grab touch-none rounded p-0.5 text-slate-400 hover:text-ink active:cursor-grabbing md:block"
            {...handleProps}
          >
            <GripIcon className="size-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold break-words">{deal.title}</p>
          {customer && (
            <Link to={`/customers/${refId(deal.customer)}`} className="block truncate text-xs text-muted hover:text-primary">
              {customer}
            </Link>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold tabular-nums">{formatMoney(deal.value)}</span>
        {deal.expectedCloseDate && <span className="text-xs text-muted">{formatDate(deal.expectedCloseDate)}</span>}
      </div>
      {!overlay && (onEdit || onStageChange) && (
        <div className="mt-2 flex items-center gap-1 border-t border-line pt-2">
          {onStageChange && (
            <select
              aria-label={`Stage for ${deal.title}`}
              value={deal.stage}
              onChange={(e) => onStageChange(deal, e.target.value as DealStage)}
              className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-white px-2 text-xs font-medium md:hidden"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <span className="hidden flex-1 md:block" />
          {onEdit && (
            <IconButton label={`Edit ${deal.title}`} onClick={() => onEdit(deal)}>
              <EditIcon className="size-4" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton label={`Delete ${deal.title}`} tone="danger" onClick={() => onDelete(deal)}>
              <TrashIcon className="size-4" />
            </IconButton>
          )}
        </div>
      )}
    </article>
  );
}

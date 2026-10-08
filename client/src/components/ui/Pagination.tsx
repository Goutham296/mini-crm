import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, total, limit, onChange }: PaginationProps) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const btn =
    'inline-flex size-9 items-center justify-center rounded-lg ring-1 ring-line text-ink hover:bg-canvas disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm" aria-label="Pagination">
      <p className="text-muted">
        <span className="font-medium text-ink">{from}</span>–<span className="font-medium text-ink">{to}</span> of{' '}
        <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="min-w-16 text-center text-muted">
          {page} / {Math.max(pages, 1)}
        </span>
        <button type="button" className={btn} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </nav>
  );
}

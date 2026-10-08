import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/Field';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { FilterIcon } from '../../components/ui/icons';
import { SearchInput } from '../../components/ui/SearchInput';
import { TASK_STATUS_FILTERS } from '../../lib/constants';
import type { TaskPriority, TaskStatusFilter } from '../../lib/types';
import { PRIORITY_OPTIONS, TASK_SORTS, type TaskSort } from './taskOptions';

interface TaskToolbarProps {
  total: number | undefined;
  status: TaskStatusFilter | '';
  priority: TaskPriority | '';
  search: string;
  sort: TaskSort;
  onChange: (changes: Record<string, string>) => void;
}

/** "Total: N tasks · Sort by · Filter" bar from the Tasks design. Every value lives in the URL. */
export function TaskToolbar({ total, status, priority, search, sort, onChange }: TaskToolbarProps) {
  const extraFilters = (priority ? 1 : 0) + (search ? 1 : 0);
  const [open, setOpen] = useState(extraFilters > 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="text-sm text-muted">
          Total: <span className="font-semibold text-ink">{total ?? '…'}</span> tasks
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <FilterSelect label="Sort by:" value={sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {TASK_SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
          <Button variant="secondary" size="sm" className="h-9" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <FilterIcon className="size-4" />
            Filter
            {extraFilters > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[11px] leading-4 text-white">{extraFilters}</span>
            )}
          </Button>
        </div>
      </div>
      <FilterTabs label="Filter by status" value={status} options={TASK_STATUS_FILTERS} onChange={(v) => onChange({ status: v })} />
      {open && (
        <div className="flex flex-col gap-3 rounded-card bg-canvas p-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(v) => onChange({ search: v })} placeholder="Search tasks" />
          <FilterSelect label="Priority:" value={priority} onChange={(e) => onChange({ priority: e.target.value })}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </FilterSelect>
          {extraFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onChange({ priority: '', search: '' })}>
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

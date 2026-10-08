import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { BoardIcon, DealsIcon, ListIcon, PlusIcon } from '../../components/ui/icons';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/states';
import { useToast } from '../../context/toastContext';
import { errorMessage } from '../../lib/api';
import { DEAL_STAGES, pickOption, stageLabel } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import { dealsApi } from '../../lib/resources';
import type { Deal, DealStage } from '../../lib/types';
import { useFetch } from '../../lib/useFetch';
import { usePageTitle } from '../../lib/usePageTitle';
import { useUrlParams } from '../../lib/useUrlParams';
import { DealForm } from './DealForm';
import { DealList } from './DealList';
import { PipelineBoard } from './PipelineBoard';

const STAGE_TABS = [{ value: '' as const, label: 'All' }, ...DEAL_STAGES];
/** The board shows every deal at once; the API caps a page at 100. */
const BOARD_LIMIT = 100;

function ViewToggle({ view, onChange }: { view: 'board' | 'list'; onChange: (v: 'board' | 'list') => void }) {
  const btn = (v: 'board' | 'list', label: string, Icon: typeof BoardIcon) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => onChange(v)}
      className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
        view === v ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
  return (
    <div className="inline-flex rounded-lg bg-canvas p-1 ring-1 ring-line" role="group" aria-label="View">
      {btn('board', 'Pipeline', BoardIcon)}
      {btn('list', 'List', ListIcon)}
    </div>
  );
}

export function DealsPage() {
  usePageTitle('Deals');
  const toast = useToast();
  const { get, set, page, key } = useUrlParams();
  const view = get('view') === 'list' ? 'list' : 'board';
  const search = get('search');
  const stage = pickOption<DealStage>(get('stage'), STAGE_TABS);

  const { data, error, loading, reload, mutate } = useFetch(key, (signal) =>
    view === 'board'
      ? dealsApi.list({ search, limit: BOARD_LIMIT }, signal)
      : dealsApi.list({ search, stage, page, limit: 10 }, signal),
  );
  const [editing, setEditing] = useState<Deal | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);

  const filtered = Boolean(search || (view === 'list' && stage));
  const addButton = (
    <Button onClick={() => setEditing('new')}>
      Add New <PlusIcon className="size-4" />
    </Button>
  );

  const replaceDeal = (deal: Deal) =>
    mutate((prev) => ({ ...prev, items: prev.items.map((d) => (d.id === deal.id ? deal : d)) }));

  /** Optimistic stage change; rolls back if the API refuses. */
  const moveDeal = async (deal: Deal, next: DealStage) => {
    if (deal.stage === next) return;
    replaceDeal({ ...deal, stage: next });
    try {
      replaceDeal(await dealsApi.setStage(deal.id, next));
      toast.success(`${deal.title} moved to ${stageLabel(next)}`);
    } catch (err) {
      replaceDeal(deal);
      toast.error(`Couldn't move ${deal.title}: ${errorMessage(err)}`);
    }
  };

  const onDelete = async (d: Deal) => {
    await dealsApi.remove(d.id);
    toast.success(`${d.title} deleted`);
    if (view === 'list' && data && data.items.length === 1 && page > 1) set({ page: page - 1 });
    else reload();
  };

  const openValue = data?.items.filter((d) => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0) ?? 0;

  return (
    <>
      <PageHeader title="Deals" actions={addButton} />
      <main className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ViewToggle view={view} onChange={(v) => set({ view: v === 'board' ? null : v, stage: null })} />
          <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Search deals by title" />
        </div>
        {view === 'list' && (
          <FilterTabs label="Filter by stage" value={stage} options={STAGE_TABS} onChange={(v) => set({ stage: v })} />
        )}

        <p className="text-sm text-muted">
          Total: <span className="font-semibold text-ink">{data?.total ?? '…'}</span> deals
          {view === 'board' && data && (
            <>
              {' '}
              · Open pipeline <span className="font-semibold text-ink">{formatMoney(openValue)}</span>
            </>
          )}
        </p>
        {view === 'board' && data && data.total > data.items.length && (
          <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning">
            Showing the {data.items.length} most recently updated deals. Use search or the list view to find the rest.
          </p>
        )}

        {loading && !data ? (
          <section className="card overflow-hidden">
            <ListSkeleton />
          </section>
        ) : error ? (
          <section className="card">
            <ErrorState message={error.message} onRetry={reload} />
          </section>
        ) : data && data.items.length === 0 && (view === 'list' || filtered) ? (
          <section className="card">
            <EmptyState
              icon={<DealsIcon className="size-7" />}
              title={filtered ? 'No deals match' : 'No deals yet'}
              message={filtered ? 'Try a different search or stage.' : 'Add a deal to start building your pipeline.'}
              action={
                filtered ? (
                  <Button variant="secondary" onClick={() => set({ search: '', stage: '' })}>
                    Clear filters
                  </Button>
                ) : (
                  addButton
                )
              }
            />
          </section>
        ) : data && view === 'board' ? (
          <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
            {data.items.length === 0 && (
              <p className="mb-3 text-sm text-muted">No deals yet — add one and it will appear in the Lead column.</p>
            )}
            <PipelineBoard deals={data.items} onMove={moveDeal} onEdit={setEditing} onDelete={setDeleting} />
          </div>
        ) : data ? (
          <section className={`card overflow-hidden ${loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={loading}>
            <DealList deals={data.items} onEdit={setEditing} onDelete={setDeleting} />
            <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={(p) => set({ page: p })} />
          </section>
        ) : null}
      </main>

      {editing && (
        <DealForm
          deal={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete deal?"
          message={`"${deleting.title}" will be permanently deleted. Its tasks are kept but unlinked from it.`}
          onConfirm={() => onDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

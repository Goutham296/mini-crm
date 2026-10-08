import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FilterSelect } from '../../components/ui/Field';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { PlusIcon, UsersIcon } from '../../components/ui/icons';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/states';
import { useToast } from '../../context/toastContext';
import { CUSTOMER_STATUSES, pickOption } from '../../lib/constants';
import { customersApi } from '../../lib/resources';
import type { Customer, CustomerStatus } from '../../lib/types';
import { useFetch } from '../../lib/useFetch';
import { usePageTitle } from '../../lib/usePageTitle';
import { useUrlParams } from '../../lib/useUrlParams';
import { CustomerForm } from './CustomerForm';
import { CustomerList } from './CustomerList';

const STATUS_TABS = [{ value: '' as const, label: 'All' }, ...CUSTOMER_STATUSES];
const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name A–Z' },
];

export function CustomersPage() {
  usePageTitle('Customers');
  const navigate = useNavigate();
  const toast = useToast();
  const { get, set, page, key } = useUrlParams();
  const search = get('search');
  const status = pickOption<CustomerStatus>(get('status'), STATUS_TABS);
  const sort = pickOption(get('sort'), SORTS);

  const { data, error, loading, reload } = useFetch(key, (signal) =>
    customersApi.list({ search, status, sort, page, limit: 10 }, signal),
  );
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const filtered = Boolean(search || status);
  const addButton = (
    <Button onClick={() => setEditing('new')}>
      Add New <PlusIcon className="size-4" />
    </Button>
  );

  const onDelete = async (c: Customer) => {
    await customersApi.remove(c.id);
    toast.success(`${c.name} deleted`);
    // Step back a page if this emptied the current one.
    if (data && data.items.length === 1 && page > 1) set({ page: page - 1 });
    else reload();
  };

  return (
    <>
      <PageHeader title="Customers" actions={addButton} />
      <main className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs label="Filter by status" value={status} options={STATUS_TABS} onChange={(v) => set({ status: v })} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Search name, company, email" />
            <FilterSelect label="Sort by:" value={sort} onChange={(e) => set({ sort: e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        <p className="text-sm text-muted">
          Total: <span className="font-semibold text-ink">{data?.total ?? '…'}</span> customers
        </p>

        <section className="card overflow-hidden" aria-busy={loading}>
          {loading && !data ? (
            <ListSkeleton />
          ) : error ? (
            <ErrorState message={error.message} onRetry={reload} />
          ) : data && data.items.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="size-7" />}
              title={filtered ? 'No customers match' : 'No customers yet'}
              message={filtered ? 'Try a different search or status.' : 'Add your first customer to start tracking deals and tasks.'}
              action={
                filtered ? (
                  <Button variant="secondary" onClick={() => set({ search: '', status: '' })}>
                    Clear filters
                  </Button>
                ) : (
                  addButton
                )
              }
            />
          ) : data ? (
            <div className={loading ? 'opacity-60 transition-opacity' : ''}>
              <CustomerList customers={data.items} onEdit={setEditing} onDelete={setDeleting} />
              <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={(p) => set({ page: p })} />
            </div>
          ) : null}
        </section>
      </main>

      {editing && (
        <CustomerForm
          customer={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(c) => {
            setEditing(null);
            if (editing === 'new') navigate(`/customers/${c.id}`);
            else reload();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete customer?"
          message={`${deleting.name} and all of their deals and tasks will be permanently deleted.`}
          onConfirm={() => onDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

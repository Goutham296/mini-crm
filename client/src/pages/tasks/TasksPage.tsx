import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PlusIcon, TasksIcon } from '../../components/ui/icons';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/states';
import { useToast } from '../../context/toastContext';
import { TASK_STATUS_FILTERS, pickOption } from '../../lib/constants';
import { tasksApi } from '../../lib/resources';
import type { Task, TaskPriority, TaskStatusFilter } from '../../lib/types';
import { useFetch } from '../../lib/useFetch';
import { usePageTitle } from '../../lib/usePageTitle';
import { useUrlParams } from '../../lib/useUrlParams';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { PRIORITY_OPTIONS, TASK_SORTS } from './taskOptions';
import { TaskToolbar } from './TaskToolbar';
import { useTaskToggle } from './useTaskToggle';

const PAGE_SIZE = 20;

export function TasksPage() {
  usePageTitle('Tasks');
  const toast = useToast();
  const { get, set, page, key } = useUrlParams();
  const status = pickOption<TaskStatusFilter>(get('status'), TASK_STATUS_FILTERS);
  const priority = pickOption<TaskPriority>(get('priority'), PRIORITY_OPTIONS);
  const sort = pickOption(get('sort'), TASK_SORTS);
  const search = get('search');

  // Sort only changes the order of the loaded page, so it is not part of the request key.
  const requestKey = new URLSearchParams([...new URLSearchParams(key)].filter(([k]) => k !== 'sort')).toString();
  const { data, error, loading, reload, mutate } = useFetch(requestKey, (signal) =>
    tasksApi.list({ status, priority, search, page, limit: PAGE_SIZE }, signal),
  );
  const replace = (task: Task) =>
    mutate((prev) => ({ ...prev, items: prev.items.map((t) => (t.id === task.id ? task : t)) }));
  // With a status filter, a toggled task may no longer belong in the list.
  const { toggle, pending } = useTaskToggle(replace, status ? reload : undefined);

  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const items = data ? (sort === 'latest' ? [...data.items].sort((a, b) => b.dueDate.localeCompare(a.dueDate)) : data.items) : [];
  const filtered = Boolean(status || priority || search);
  const addButton = (
    <Button onClick={() => setEditing('new')}>
      Add New Task <PlusIcon className="size-4" />
    </Button>
  );

  const onDelete = async (t: Task) => {
    await tasksApi.remove(t.id);
    toast.success('Task deleted');
    if (data && data.items.length === 1 && page > 1) set({ page: page - 1 });
    else reload();
  };

  return (
    <>
      <PageHeader title="Tasks" actions={addButton} />
      <main className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <TaskToolbar
          total={data?.total}
          status={status}
          priority={priority}
          search={search}
          sort={sort}
          onChange={(changes) => set(changes)}
        />

        <section className="card overflow-hidden" aria-busy={loading}>
          {loading && !data ? (
            <ListSkeleton />
          ) : error ? (
            <ErrorState message={error.message} onRetry={reload} />
          ) : data && data.items.length === 0 ? (
            <EmptyState
              icon={<TasksIcon className="size-7" />}
              title={filtered ? 'No tasks match' : 'No tasks yet'}
              message={filtered ? 'Try a different filter.' : 'Add a task to keep track of follow-ups and meetings.'}
              action={
                filtered ? (
                  <Button variant="secondary" onClick={() => set({ status: '', priority: '', search: '' })}>
                    Clear filters
                  </Button>
                ) : (
                  addButton
                )
              }
            />
          ) : data ? (
            <div className={loading ? 'opacity-60 transition-opacity' : ''}>
              <TaskList tasks={items} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} pending={pending} />
              <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={(p) => set({ page: p })} />
            </div>
          ) : null}
        </section>
      </main>

      {editing && (
        <TaskForm
          task={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${deleting.title}" will be permanently deleted.`}
          onConfirm={() => onDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

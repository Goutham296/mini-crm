import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ChevronLeftIcon, DealsIcon, PlusIcon, TasksIcon } from '../../components/ui/icons';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '../../components/ui/states';
import { useToast } from '../../context/toastContext';
import { ApiError } from '../../lib/api';
import { customersApi, dealsApi, tasksApi } from '../../lib/resources';
import type { Deal, Task } from '../../lib/types';
import { useFetch } from '../../lib/useFetch';
import { usePageTitle } from '../../lib/usePageTitle';
import { DealForm } from '../deals/DealForm';
import { DealList } from '../deals/DealList';
import { TaskForm } from '../tasks/TaskForm';
import { TaskList } from '../tasks/TaskList';
import { useTaskToggle } from '../tasks/useTaskToggle';
import { CustomerForm } from './CustomerForm';
import { CustomerProfile } from './CustomerProfile';

type Dialog =
  | { kind: 'customer' }
  | { kind: 'delete-customer' }
  | { kind: 'deal'; deal?: Deal }
  | { kind: 'delete-deal'; deal: Deal }
  | { kind: 'task'; task?: Task }
  | { kind: 'delete-task'; task: Task };

function Section({ title, count, action, children }: { title: string; count: number; action: ReactNode; children: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold">
          {title} <span className="ml-1 text-sm font-medium text-muted">{count}</span>
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

const BackLink = () => (
  <Link to="/customers" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
    <ChevronLeftIcon className="size-4" />
    All customers
  </Link>
);

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: loaded, error, loading, reload, mutate } = useFetch(`customer:${id}`, (signal) => customersApi.detail(id, signal));
  // Don't show the previous customer while another one loads.
  const data = loaded?.customer.id === id ? loaded : undefined;
  usePageTitle(data?.customer.name ?? 'Customer');
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);
  const saved = () => {
    close();
    reload();
  };

  const replaceTask = (task: Task) =>
    mutate((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)) }));
  const { toggle, pending } = useTaskToggle(replaceTask);

  if (error) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <>
        <PageHeader title="Customer" />
        <main className="space-y-4 px-4 py-5 sm:px-6 lg:px-8">
          <BackLink />
          <div className="card">
            {missing ? (
              <EmptyState title="Customer not found" message="It may have been deleted." action={<BackLink />} />
            ) : (
              <ErrorState message={error.message} onRetry={reload} />
            )}
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title={<Skeleton className="h-6 w-40" />} />
        <main className="space-y-4 px-4 py-5 sm:px-6 lg:px-8" aria-busy="true">
          <BackLink />
          <div className="card overflow-hidden">
            <ListSkeleton rows={4} />
          </div>
        </main>
      </>
    );
  }

  const { customer, deals, tasks } = data;
  return (
    <>
      <PageHeader title={customer.name} />
      <main className={`space-y-5 px-4 py-5 sm:px-6 lg:px-8 ${loading ? 'opacity-70 transition-opacity' : ''}`}>
        <BackLink />
        <CustomerProfile
          customer={customer}
          deals={deals}
          tasks={tasks}
          onEdit={() => setDialog({ kind: 'customer' })}
          onDelete={() => setDialog({ kind: 'delete-customer' })}
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <Section
            title="Deals"
            count={deals.length}
            action={
              <Button size="sm" onClick={() => setDialog({ kind: 'deal' })}>
                <PlusIcon className="size-4" /> Add deal
              </Button>
            }
          >
            {deals.length === 0 ? (
              <EmptyState icon={<DealsIcon className="size-7" />} title="No deals yet" message="Add a deal for this customer." />
            ) : (
              <DealList
                deals={deals}
                hideCustomer
                onEdit={(deal) => setDialog({ kind: 'deal', deal })}
                onDelete={(deal) => setDialog({ kind: 'delete-deal', deal })}
              />
            )}
          </Section>
          <Section
            title="Tasks"
            count={tasks.length}
            action={
              <Button size="sm" onClick={() => setDialog({ kind: 'task' })}>
                <PlusIcon className="size-4" /> Add task
              </Button>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState icon={<TasksIcon className="size-7" />} title="No tasks yet" message="Add a follow-up for this customer." />
            ) : (
              <TaskList
                tasks={tasks}
                pending={pending}
                onToggle={toggle}
                onEdit={(task) => setDialog({ kind: 'task', task })}
                onDelete={(task) => setDialog({ kind: 'delete-task', task })}
              />
            )}
          </Section>
        </div>
      </main>

      {dialog?.kind === 'customer' && <CustomerForm customer={customer} onClose={close} onSaved={saved} />}
      {dialog?.kind === 'delete-customer' && (
        <ConfirmDialog
          title="Delete customer?"
          message={`${customer.name} and all of their deals and tasks will be permanently deleted.`}
          onConfirm={async () => {
            await customersApi.remove(customer.id);
            toast.success(`${customer.name} deleted`);
            navigate('/customers', { replace: true });
          }}
          onClose={close}
        />
      )}
      {dialog?.kind === 'deal' && <DealForm deal={dialog.deal} customerId={customer.id} onClose={close} onSaved={saved} />}
      {dialog?.kind === 'delete-deal' && (
        <ConfirmDialog
          title="Delete deal?"
          message={`"${dialog.deal.title}" will be permanently deleted. Its tasks are kept but unlinked from it.`}
          onConfirm={async () => {
            await dealsApi.remove(dialog.deal.id);
            toast.success('Deal deleted');
            reload();
          }}
          onClose={close}
        />
      )}
      {dialog?.kind === 'task' && <TaskForm task={dialog.task} customerId={customer.id} onClose={close} onSaved={saved} />}
      {dialog?.kind === 'delete-task' && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${dialog.task.title}" will be permanently deleted.`}
          onConfirm={async () => {
            await tasksApi.remove(dialog.task.id);
            toast.success('Task deleted');
            reload();
          }}
          onClose={close}
        />
      )}
    </>
  );
}

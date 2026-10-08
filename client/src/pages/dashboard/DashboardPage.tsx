import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { ErrorState, Skeleton } from '../../components/ui/states';
import { useAuth } from '../../context/authContext';
import { dashboardApi } from '../../lib/resources';
import { useFetch } from '../../lib/useFetch';
import { usePageTitle } from '../../lib/usePageTitle';
import { CustomerForm } from '../customers/CustomerForm';
import { DealForm } from '../deals/DealForm';
import { TaskForm } from '../tasks/TaskForm';
import { AddNewMenu, type NewKind } from './AddNewMenu';
import { PipelineChart } from './PipelineChart';
import { RecentDeals } from './RecentDeals';
import { StatCards } from './StatCards';
import { TasksToDo } from './TasksToDo';
import { Widget } from './Widget';

export function DashboardPage() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  /** Bumped after any change so every widget reloads. */
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);
  const { data, error, reload } = useFetch(`dashboard:${version}`, (signal) => dashboardApi.get(signal));
  const [creating, setCreating] = useState<NewKind | null>(null);

  const saved = () => {
    setCreating(null);
    refresh();
  };

  return (
    <>
      <PageHeader title="Dashboard" actions={<AddNewMenu onPick={setCreating} />} />
      <main className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        {user && (
          <p className="text-sm text-muted">
            Welcome back, <span className="font-semibold text-ink">{user.name.split(' ')[0]}</span>. Here's where things stand.
          </p>
        )}

        {error && !data ? (
          <div className="card">
            <ErrorState message={error.message} onRetry={reload} />
          </div>
        ) : (
          <StatCards data={data} />
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <Widget title="Pipeline value by stage" viewAll="/deals" className="lg:col-span-2">
            <div className="px-2 pb-4 sm:px-4">
              {data ? <PipelineChart data={data.pipelineByStage} /> : error ? null : <Skeleton className="h-64 w-full" />}
              {error && !data && <p className="py-10 text-center text-sm text-muted">Chart unavailable.</p>}
            </div>
          </Widget>
          <TasksToDo version={version} onChanged={refresh} />
          <div className="lg:col-span-3">
            <RecentDeals version={version} />
          </div>
        </div>
      </main>

      {creating === 'customer' && (
        <CustomerForm onClose={() => setCreating(null)} onSaved={(c) => navigate(`/customers/${c.id}`)} />
      )}
      {creating === 'deal' && <DealForm onClose={() => setCreating(null)} onSaved={saved} />}
      {creating === 'task' && <TaskForm onClose={() => setCreating(null)} onSaved={saved} />}
    </>
  );
}

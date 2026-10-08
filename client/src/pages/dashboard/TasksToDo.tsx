import { useState, type FormEvent } from 'react';
import { ArrowRightIcon } from '../../components/ui/icons';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/states';
import { useToast } from '../../context/toastContext';
import { errorMessage } from '../../lib/api';
import { todayInput } from '../../lib/format';
import { tasksApi } from '../../lib/resources';
import type { Task } from '../../lib/types';
import { useFetch } from '../../lib/useFetch';
import { CompleteCheckbox, DueDate } from '../tasks/TaskList';
import { useTaskToggle } from '../tasks/useTaskToggle';
import { Widget } from './Widget';

/** Open tasks, soonest (and overdue) first, with a quick "add task due today" box. */
export function TasksToDo({ version, onChanged }: { version: number; onChanged: () => void }) {
  const toast = useToast();
  const { data, error, reload, mutate } = useFetch(`todo:${version}`, (signal) =>
    tasksApi.list({ status: 'open', limit: 6 }, signal),
  );
  const replace = (task: Task) =>
    mutate((prev) => ({ ...prev, items: prev.items.map((t) => (t.id === task.id ? task : t)) }));
  const { toggle, pending } = useTaskToggle(replace, onChanged);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const quickAdd = async (e: FormEvent) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setAdding(true);
    try {
      await tasksApi.create({ title: text, dueDate: todayInput(), priority: 'medium', customer: null, deal: null });
      setTitle('');
      toast.success('Task added for today');
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Widget title="Tasks To Do" viewAll="/tasks?status=open">
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <ListSkeleton rows={4} />
      ) : data.items.length === 0 ? (
        <EmptyState title="All caught up" message="No open tasks. Add one below." />
      ) : (
        <ul className="divide-y divide-line">
          {data.items.map((t) => (
            <li key={t.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
              <CompleteCheckbox task={t} onToggle={toggle} disabled={pending.has(t.id)} />
              <div className="min-w-0 flex-1">
                <p className={`break-words ${t.done ? 'text-muted line-through' : 'font-medium'}`}>{t.title}</p>
                <p className="text-xs">
                  <DueDate task={t} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={quickAdd} className="flex items-center gap-2 border-t border-line px-4 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new task for today"
          aria-label="New task title"
          maxLength={200}
          className="h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          aria-label="Add task"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {adding ? <Spinner className="size-4" /> : <ArrowRightIcon className="size-4" />}
        </button>
      </form>
    </Widget>
  );
}

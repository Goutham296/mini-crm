import { Link } from 'react-router-dom';
import { PriorityBadge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { AlertIcon, CheckIcon, EditIcon, TrashIcon } from '../../components/ui/icons';
import { formatDate } from '../../lib/format';
import { refId, refName } from '../../lib/resources';
import type { Task } from '../../lib/types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  /** Ids of tasks whose done toggle is in flight. */
  pending?: Set<string>;
  hideLinks?: boolean;
}

export function CompleteCheckbox({ task, onToggle, disabled }: { task: Task; onToggle: (t: Task) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      disabled={disabled}
      onClick={() => onToggle(task)}
      className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors disabled:opacity-50 ${
        task.done ? 'border-success bg-success text-white' : 'border-slate-300 bg-white hover:border-primary'
      }`}
    >
      {task.done && <CheckIcon className="size-3.5" />}
    </button>
  );
}

export function DueDate({ task }: { task: Task }) {
  if (task.overdue) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
        <span className="flex size-4 items-center justify-center rounded-full bg-danger text-white" aria-hidden="true">
          <AlertIcon className="size-3" />
        </span>
        {formatDate(task.dueDate)}
        <span className="sr-only">(overdue)</span>
      </span>
    );
  }
  return <span className={task.done ? 'text-success' : 'text-ink'}>{formatDate(task.dueDate)}</span>;
}

function Links({ task }: { task: Task }) {
  const customer = refName(task.customer);
  const deal = task.deal && typeof task.deal !== 'string' ? task.deal.title : '';
  if (!customer && !deal) return null;
  return (
    <span className="mt-0.5 block text-xs text-muted">
      {customer && (
        <Link to={`/customers/${refId(task.customer)}`} className="hover:text-primary hover:underline">
          {customer}
        </Link>
      )}
      {customer && deal && ' · '}
      {deal && <span>{deal}</span>}
    </span>
  );
}

function Title({ task, hideLinks }: { task: Task; hideLinks?: boolean }) {
  return (
    <>
      <span className={`block break-words ${task.done ? 'text-muted line-through decoration-success/60' : 'font-medium'}`}>
        {task.title}
      </span>
      {!hideLinks && <Links task={task} />}
    </>
  );
}

function Actions({ task, onEdit, onDelete }: { task: Task } & Pick<TaskListProps, 'onEdit' | 'onDelete'>) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton label={`Edit "${task.title}"`} onClick={() => onEdit(task)}>
        <EditIcon className="size-4" />
      </IconButton>
      <IconButton label={`Delete "${task.title}"`} tone="danger" onClick={() => onDelete(task)}>
        <TrashIcon className="size-4" />
      </IconButton>
    </div>
  );
}

export function TaskList({ tasks, onToggle, onEdit, onDelete, pending, hideLinks }: TaskListProps) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs font-semibold uppercase tracking-wide text-muted">
          <tr className="border-b border-line">
            <th className="w-24 px-4 py-3 font-semibold">Complete</th>
            <th className="w-40 px-4 py-3 font-semibold">Due Date</th>
            <th className="px-4 py-3 font-semibold">Task</th>
            <th className="w-28 px-4 py-3 font-semibold">Priority</th>
            <th className="w-24 px-4 py-3 text-right font-semibold">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tasks.map((t) => (
            <tr key={t.id} className={t.overdue ? 'bg-danger-50/40' : 'hover:bg-canvas/60'}>
              <td className="px-4 py-3">
                <CompleteCheckbox task={t} onToggle={onToggle} disabled={pending?.has(t.id)} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <DueDate task={t} />
              </td>
              <td className="px-4 py-3">
                <Title task={t} hideLinks={hideLinks} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="px-4 py-3">
                <Actions task={t} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {tasks.map((t) => (
          <li key={t.id} className={`flex items-start gap-3 px-4 py-3 ${t.overdue ? 'bg-danger-50/40' : ''}`}>
            <div className="pt-0.5">
              <CompleteCheckbox task={t} onToggle={onToggle} disabled={pending?.has(t.id)} />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <Title task={t} hideLinks={hideLinks} />
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <DueDate task={t} />
                <PriorityBadge priority={t.priority} />
              </div>
            </div>
            <Actions task={t} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
}

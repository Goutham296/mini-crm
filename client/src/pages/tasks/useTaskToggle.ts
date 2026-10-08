import { useState } from 'react';
import { useToast } from '../../context/toastContext';
import { errorMessage } from '../../lib/api';
import { tasksApi } from '../../lib/resources';
import type { Task } from '../../lib/types';

/**
 * Optimistic "done" toggle. `replace` swaps a task in whatever list holds it;
 * the previous version is restored if the API call fails.
 */
export function useTaskToggle(replace: (task: Task) => void, onSettled?: () => void) {
  const toast = useToast();
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  const setBusy = (id: string, busy: boolean) =>
    setPending((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggle = async (task: Task) => {
    const done = !task.done;
    setBusy(task.id, true);
    replace({ ...task, done, overdue: done ? false : task.overdue });
    try {
      replace(await tasksApi.update(task.id, { done }));
      toast.success(done ? 'Task completed' : 'Task reopened');
      onSettled?.();
    } catch (err) {
      replace(task);
      toast.error(`Couldn't update the task: ${errorMessage(err)}`);
    } finally {
      setBusy(task.id, false);
    }
  };

  return { toggle, pending };
}

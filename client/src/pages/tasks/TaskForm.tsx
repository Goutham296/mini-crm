import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { SelectField, TextField } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/toastContext';
import { ApiError, errorMessage } from '../../lib/api';
import { TASK_PRIORITIES } from '../../lib/constants';
import { toDateInput, todayInput } from '../../lib/format';
import { refId, tasksApi } from '../../lib/resources';
import type { Task, TaskPriority } from '../../lib/types';
import { useCustomerOptions, useDealOptions } from '../../lib/useOptions';
import { hasErrors, type Errors } from '../../lib/validation';

interface TaskFormProps {
  task?: Task;
  /** Preselected links, e.g. when adding from a customer page. */
  customerId?: string;
  dealId?: string;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

interface FormState {
  title: string;
  dueDate: string;
  priority: TaskPriority;
  customer: string;
  deal: string;
}

export function TaskForm({ task, customerId, dealId, onClose, onSaved }: TaskFormProps) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>({
    title: task?.title ?? '',
    dueDate: task ? toDateInput(task.dueDate) : todayInput(),
    priority: task?.priority ?? 'medium',
    customer: task ? refId(task.customer) : customerId ?? '',
    deal: task ? refId(task.deal) : dealId ?? '',
  });
  const { customers, loading: loadingCustomers } = useCustomerOptions();
  const { deals, loading: loadingDeals } = useDealOptions(form.customer);
  const [errors, setErrors] = useState<Errors<keyof FormState>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
      // A deal belongs to one customer, so changing the customer clears the deal.
      ...(key === 'customer' && e.target.value !== f.customer ? { deal: '' } : {}),
    }));

  /** Picking a deal also fills in its customer. */
  const onDealChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const deal = deals.find((d) => d.id === e.target.value);
    setForm((f) => ({ ...f, deal: e.target.value, customer: deal ? refId(deal.customer) || f.customer : f.customer }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<keyof FormState> = {
      title: !form.title.trim() ? 'Task is required' : form.title.length > 200 ? 'Task is too long' : undefined,
      dueDate: !form.dueDate ? 'Choose a due date' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        dueDate: form.dueDate,
        priority: form.priority,
        customer: form.customer || null,
        deal: form.deal || null,
      };
      const saved = task ? await tasksApi.update(task.id, body) : await tasksApi.create(body);
      toast.success(task ? 'Task updated' : 'Task added');
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors());
      setFormError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={task ? 'Edit task' : 'Add new task'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={busy}>
            {task ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger sm:col-span-2">{formError}</p>}
        <div className="sm:col-span-2">
          <TextField label="Task" required value={form.title} onChange={set('title')} error={errors.title} maxLength={200} />
        </div>
        <TextField label="Due date" required type="date" value={form.dueDate} onChange={set('dueDate')} error={errors.dueDate} />
        <SelectField label="Priority" value={form.priority} onChange={set('priority')} error={errors.priority}>
          {TASK_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Customer"
          value={form.customer}
          onChange={set('customer')}
          error={errors.customer}
          disabled={loadingCustomers}
          hint="Optional"
        >
          <option value="">{loadingCustomers ? 'Loading…' : 'No customer'}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Deal"
          value={form.deal}
          onChange={onDealChange}
          error={errors.deal}
          disabled={loadingDeals}
          hint={form.customer ? "Optional — this customer's deals" : 'Optional'}
        >
          <option value="">{loadingDeals ? 'Loading…' : 'No deal'}</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </SelectField>
      </form>
    </Modal>
  );
}

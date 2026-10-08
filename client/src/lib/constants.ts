import type { CustomerStatus, DealStage, TaskPriority, TaskStatusFilter } from './types';

export const CUSTOMER_STATUSES: { value: CustomerStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TASK_STATUS_FILTERS: { value: TaskStatusFilter | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'today', label: 'Due today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'done', label: 'Done' },
];

export const stageLabel = (stage: DealStage) => DEAL_STAGES.find((s) => s.value === stage)?.label ?? stage;
export const statusLabel = (s: CustomerStatus) => CUSTOMER_STATUSES.find((x) => x.value === s)?.label ?? s;

/** Narrows an arbitrary URL value to one of the allowed options ('' when it is not one). */
export function pickOption<T extends string>(value: string | null, options: { value: T | '' }[]): T | '' {
  return options.some((o) => o.value === value) ? (value as T) : '';
}

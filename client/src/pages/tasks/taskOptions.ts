import { TASK_PRIORITIES } from '../../lib/constants';

export const TASK_SORTS = [
  { value: '' as const, label: 'Due Date (soonest)' },
  { value: 'latest' as const, label: 'Due Date (latest)' },
];
export type TaskSort = (typeof TASK_SORTS)[number]['value'];

export const PRIORITY_OPTIONS = [{ value: '' as const, label: 'Any priority' }, ...TASK_PRIORITIES];

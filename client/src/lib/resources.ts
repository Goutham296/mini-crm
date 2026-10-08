import { api } from './api';
import { tzOffset } from './format';
import type { Customer, CustomerDetail, Dashboard, Deal, DealStage, Paginated, Task } from './types';

type Query = Record<string, string | number | undefined>;

export interface CustomerInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: Customer['status'];
  notes: string;
}

export interface DealInput {
  title: string;
  value: number;
  stage: DealStage;
  customer: string;
  expectedCloseDate: string | null;
}

export interface TaskInput {
  title: string;
  dueDate: string;
  priority: Task['priority'];
  done?: boolean;
  customer: string | null;
  deal: string | null;
}

export const customersApi = {
  list: (q: Query, signal?: AbortSignal) => api.get<Paginated<Customer>>('/customers', q, signal),
  /** Up to 100 customers by name, for select inputs. */
  options: (signal?: AbortSignal) => api.get<Paginated<Customer>>('/customers', { limit: 100, sort: 'name' }, signal),
  detail: (id: string, signal?: AbortSignal) =>
    api.get<CustomerDetail>(`/customers/${id}`, { tzOffset: tzOffset() }, signal),
  create: (body: CustomerInput) => api.post<Customer>('/customers', body),
  update: (id: string, body: Partial<CustomerInput>) => api.patch<Customer>(`/customers/${id}`, body),
  remove: (id: string) => api.del(`/customers/${id}`),
};

export const dealsApi = {
  list: (q: Query, signal?: AbortSignal) => api.get<Paginated<Deal>>('/deals', q, signal),
  create: (body: DealInput) => api.post<Deal>('/deals', body),
  update: (id: string, body: Partial<DealInput>) => api.patch<Deal>(`/deals/${id}`, body),
  setStage: (id: string, stage: DealStage) => api.patch<Deal>(`/deals/${id}/stage`, { stage }),
  remove: (id: string) => api.del(`/deals/${id}`),
};

export const tasksApi = {
  list: (q: Query, signal?: AbortSignal) =>
    api.get<Paginated<Task>>('/tasks', { ...q, tzOffset: tzOffset() }, signal),
  create: (body: TaskInput) => api.post<Task>('/tasks', body, { tzOffset: tzOffset() }),
  update: (id: string, body: Partial<TaskInput>) => api.patch<Task>(`/tasks/${id}`, body, { tzOffset: tzOffset() }),
  remove: (id: string) => api.del(`/tasks/${id}`),
};

export const dashboardApi = {
  get: (signal?: AbortSignal) => api.get<Dashboard>('/dashboard', { tzOffset: tzOffset() }, signal),
};

/** Linked records can be populated objects or bare ids depending on the endpoint. */
export const refId = (ref: { id: string } | string | null | undefined) => (typeof ref === 'string' ? ref : ref?.id ?? '');
export const refName = (ref: { name: string } | string | null | undefined) => (ref && typeof ref !== 'string' ? ref.name : '');

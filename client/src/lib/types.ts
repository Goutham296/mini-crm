export type CustomerStatus = 'lead' | 'active' | 'inactive';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatusFilter = 'open' | 'done' | 'overdue' | 'today';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRef {
  id: string;
  name: string;
  company?: string;
  status?: CustomerStatus;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string | null;
  wonAt?: string | null;
  /** Populated on deal endpoints, a plain id on the customer detail endpoint. */
  customer: CustomerRef | string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  done: boolean;
  overdue: boolean;
  customer: CustomerRef | string | null;
  deal: { id: string; title: string; stage: DealStage } | string | null;
  createdAt: string;
}

export interface Dashboard {
  totalCustomers: number;
  openPipelineValue: number;
  openDeals: number;
  dealsWonThisMonth: { count: number; value: number };
  tasksDueToday: number;
  overdueTasks: number;
  pipelineByStage: { stage: DealStage; value: number; count: number }[];
}

export interface CustomerDetail {
  customer: Customer;
  deals: Deal[];
  tasks: Task[];
}

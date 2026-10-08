export const CUSTOMER_STATUSES = ['lead', 'active', 'inactive'] as const;
export const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'won', 'lost'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_STATUS_FILTERS = ['open', 'done', 'overdue', 'today'] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const AUTH_COOKIE = 'token';
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const BCRYPT_ROUNDS = 12;

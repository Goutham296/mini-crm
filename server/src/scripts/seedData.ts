import type { CustomerStatus, DealStage, TaskPriority } from '../config/constants.js';

export const DEMO_USER = { name: 'Demo User', email: 'demo@minicrm.test', password: 'Demo@1234' };

export const CUSTOMERS: { name: string; company: string; status: CustomerStatus; notes: string }[] = [
  { name: 'Aarav Mehta', company: 'Brightline Logistics', status: 'active', notes: 'Prefers calls before 11am.' },
  { name: 'Priya Nair', company: 'Kite Analytics', status: 'active', notes: 'Decision maker for data tooling.' },
  { name: 'Rohan Gupta', company: 'Summit Foods', status: 'lead', notes: 'Met at the retail expo.' },
  { name: 'Ananya Rao', company: 'Bluepeak Health', status: 'active', notes: 'Renewal due next quarter.' },
  { name: 'Vikram Shah', company: 'Ironbridge Constructions', status: 'inactive', notes: 'Paused purchasing this year.' },
  { name: 'Meera Iyer', company: 'Lotus Learning', status: 'lead', notes: 'Asked for an education discount.' },
  { name: 'Karan Malhotra', company: 'Nimbus Cloudworks', status: 'active', notes: 'Technical champion: CTO.' },
  { name: 'Sneha Kulkarni', company: 'Greenleaf Organics', status: 'lead', notes: 'Inbound from website form.' },
  { name: 'Arjun Reddy', company: 'Deccan Motors', status: 'active', notes: 'Multi-branch rollout planned.' },
  { name: 'Ishita Banerjee', company: 'Coral Studio', status: 'inactive', notes: 'Agency, project-based work.' },
  { name: 'Dev Patel', company: 'Orbit Fintech', status: 'lead', notes: 'Needs SOC 2 documents.' },
  { name: 'Kavya Menon', company: 'Harbor Retail', status: 'active', notes: 'Quarterly business reviews.' },
];

/** customer = index into CUSTOMERS; closeInDays relative to today; wonDaysAgo only for won deals. */
export const DEALS: {
  title: string;
  value: number;
  stage: DealStage;
  customer: number;
  closeInDays: number;
  wonDaysAgo?: number;
}[] = [
  { title: 'Fleet tracking annual plan', value: 480000, stage: 'proposal', customer: 0, closeInDays: 14 },
  { title: 'Analytics seats expansion', value: 220000, stage: 'qualified', customer: 1, closeInDays: 30 },
  { title: 'POS pilot', value: 95000, stage: 'lead', customer: 2, closeInDays: 45 },
  { title: 'Clinic suite renewal', value: 360000, stage: 'won', customer: 3, closeInDays: -2, wonDaysAgo: 0 },
  { title: 'Site safety module', value: 150000, stage: 'lost', customer: 4, closeInDays: -20 },
  { title: 'LMS onboarding package', value: 70000, stage: 'lead', customer: 5, closeInDays: 60 },
  { title: 'Cloud cost dashboard', value: 540000, stage: 'proposal', customer: 6, closeInDays: 10 },
  { title: 'Subscription box CRM', value: 60000, stage: 'qualified', customer: 7, closeInDays: 25 },
  { title: 'Dealer network rollout', value: 820000, stage: 'won', customer: 8, closeInDays: -5, wonDaysAgo: 1 },
  { title: 'Brand portal', value: 120000, stage: 'lost', customer: 9, closeInDays: -40 },
  { title: 'Compliance workflow', value: 300000, stage: 'qualified', customer: 10, closeInDays: 35 },
  { title: 'Store ops add-on', value: 180000, stage: 'won', customer: 11, closeInDays: -1, wonDaysAgo: 2 },
  { title: 'Warehouse scanners', value: 210000, stage: 'won', customer: 0, closeInDays: -50, wonDaysAgo: 50 },
  { title: 'Data warehouse migration', value: 400000, stage: 'lead', customer: 1, closeInDays: 70 },
  { title: 'Telehealth integration', value: 260000, stage: 'proposal', customer: 3, closeInDays: 20 },
];

/** dueInDays relative to today (negative = overdue unless done). */
export const TASKS: {
  title: string;
  dueInDays: number;
  priority: TaskPriority;
  done: boolean;
  customer?: number;
  deal?: number;
}[] = [
  { title: 'Send revised fleet proposal', dueInDays: -3, priority: 'high', done: false, deal: 0 },
  { title: 'Book demo with Kite data team', dueInDays: 0, priority: 'medium', done: false, deal: 1 },
  { title: 'Intro call with Summit Foods', dueInDays: 2, priority: 'medium', done: false, customer: 2 },
  { title: 'Kick-off meeting for clinic renewal', dueInDays: -1, priority: 'low', done: true, deal: 3 },
  { title: 'Share LMS pricing sheet', dueInDays: -2, priority: 'medium', done: false, customer: 5 },
  { title: 'Security review with Nimbus CTO', dueInDays: 0, priority: 'high', done: false, deal: 6 },
  { title: 'Follow up on website enquiry', dueInDays: 1, priority: 'low', done: false, customer: 7 },
  { title: 'Prepare dealer training plan', dueInDays: 5, priority: 'medium', done: false, deal: 8 },
  { title: 'Send SOC 2 report to Orbit', dueInDays: -5, priority: 'high', done: false, deal: 10 },
  { title: 'QBR deck for Harbor Retail', dueInDays: 0, priority: 'medium', done: false, customer: 11 },
  { title: 'Collect warehouse scanner feedback', dueInDays: -7, priority: 'low', done: true, deal: 12 },
  { title: 'Scope data migration', dueInDays: 7, priority: 'medium', done: false, deal: 13 },
  { title: 'Telehealth API walkthrough', dueInDays: 3, priority: 'high', done: false, deal: 14 },
  { title: 'Check in with Vikram about next year', dueInDays: 14, priority: 'low', done: false, customer: 4 },
  { title: 'Update CRM notes for Q4', dueInDays: -1, priority: 'low', done: false },
];

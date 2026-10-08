import type { ReactNode } from 'react';
import type { CustomerStatus, DealStage, TaskPriority } from '../../lib/types';
import { stageLabel, statusLabel } from '../../lib/constants';

type Tone = 'purple' | 'green' | 'red' | 'grey' | 'amber' | 'blue';

const TONES: Record<Tone, string> = {
  purple: 'bg-primary text-white',
  blue: 'bg-primary-100 text-primary-700',
  green: 'bg-success-50 text-success',
  red: 'bg-danger-50 text-danger',
  amber: 'bg-warning-50 text-warning',
  grey: 'bg-slate-100 text-slate-600',
};

export function Badge({ tone = 'grey', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<CustomerStatus, Tone> = { lead: 'blue', active: 'purple', inactive: 'grey' };
const STAGE_TONE: Record<DealStage, Tone> = {
  lead: 'grey',
  qualified: 'blue',
  proposal: 'purple',
  won: 'green',
  lost: 'red',
};
const PRIORITY_TONE: Record<TaskPriority, Tone> = { low: 'grey', medium: 'amber', high: 'red' };

export const StatusBadge = ({ status }: { status: CustomerStatus }) => (
  <Badge tone={STATUS_TONE[status]}>{statusLabel(status)}</Badge>
);
export const StageBadge = ({ stage }: { stage: DealStage }) => <Badge tone={STAGE_TONE[stage]}>{stageLabel(stage)}</Badge>;
export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => (
  <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>
);

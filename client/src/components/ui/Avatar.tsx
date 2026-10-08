import { initials } from '../../lib/format';

const PALETTE = ['bg-primary-100 text-primary-700', 'bg-success-50 text-success', 'bg-warning-50 text-warning', 'bg-danger-50 text-danger', 'bg-slate-100 text-slate-600'];

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0);
  const dims = size === 'lg' ? 'size-14 text-lg' : size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${PALETTE[hash % PALETTE.length]}`}
    >
      {initials(name)}
    </span>
  );
}

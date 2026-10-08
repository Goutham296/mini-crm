const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatMoney = (n: number) => currency.format(n);
export const formatMoneyCompact = (n: number) => compact.format(n);

/** Calendar dates are stored as UTC midnight, so format them in UTC to avoid an off-by-one day. */
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}

/** ISO string → value for <input type="date"> (YYYY-MM-DD). */
export const toDateInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');

/** Today's local calendar date as YYYY-MM-DD. */
export function todayInput(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export const tzOffset = () => new Date().getTimezoneOffset();

/**
 * Date helpers. `tzOffset` follows JavaScript's Date#getTimezoneOffset() convention
 * (minutes, UTC minus local; India = -330). Defaults to 0 (UTC).
 *
 * Task due dates are calendar dates stored as UTC midnight, so "today" for a task is
 * the client's local calendar date expressed as UTC midnight.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

function localParts(now: Date, tzOffset: number) {
  const local = new Date(now.getTime() - tzOffset * 60_000);
  return { y: local.getUTCFullYear(), m: local.getUTCMonth(), d: local.getUTCDate() };
}

/** Calendar date (UTC midnight) of "today" for the client. */
export function todayDate(now = new Date(), tzOffset = 0): Date {
  const { y, m, d } = localParts(now, tzOffset);
  return new Date(Date.UTC(y, m, d));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Real instant at which the client's current month started. */
export function monthStart(now = new Date(), tzOffset = 0): Date {
  const { y, m } = localParts(now, tzOffset);
  return new Date(Date.UTC(y, m, 1) + tzOffset * 60_000);
}

/** Strips the time part, keeping the UTC calendar date. */
export function toCalendarDate(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

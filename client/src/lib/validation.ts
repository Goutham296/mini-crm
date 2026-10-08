const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s().-]*$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isPhone = (v: string) => PHONE_RE.test(v.trim());

/** Mirrors the API's password rule: 8–72 chars, at least one letter and one number. */
export function passwordProblem(pw: string): string | undefined {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain a letter';
  if (!/\d/.test(pw)) return 'Password must contain a number';
  return undefined;
}

export type Errors<K extends string> = Partial<Record<K, string>>;
export const hasErrors = (e: Record<string, string | undefined>) => Object.values(e).some(Boolean);

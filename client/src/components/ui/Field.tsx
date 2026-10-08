import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const control =
  'w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-canvas';
const border = (error?: string) => (error ? 'border-danger focus:border-danger' : 'border-line focus:border-primary');

interface WrapperProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

function FieldWrapper({ label, error, hint, required, children }: WrapperProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children(id, error || hint ? msgId : undefined)}
      {error ? (
        <p id={msgId} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, required, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      {(id, d) => (
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={d}
          required={required}
          className={`${control} ${border(error)} h-10`}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  required,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      {(id, d) => (
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={d}
          required={required}
          className={`${control} ${border(error)} h-10`}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldWrapper>
  );
}

export function TextAreaField({ label, error, hint, required, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      {(id, d) => (
        <textarea
          id={id}
          aria-invalid={!!error}
          aria-describedby={d}
          required={required}
          rows={4}
          className={`${control} ${border(error)} py-2`}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
}

/** Compact select used in toolbars (filters, sort). */
export function FilterSelect({
  label,
  className = '',
  children,
  ...rest
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex items-center gap-2 text-sm text-muted ${className}`}>
      <span className="whitespace-nowrap">{label}</span>
      <select
        className="h-9 rounded-lg border border-line bg-white px-2.5 text-sm font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

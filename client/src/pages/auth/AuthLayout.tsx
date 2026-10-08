import type { ReactNode } from 'react';
import { Logo } from '../../components/layout/Logo';

const HIGHLIGHTS = ['Customers with their deals and tasks in one place', 'Drag-and-drop pipeline board', 'Overdue tasks flagged automatically'];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-10" />
          <span className="text-lg font-bold">Mini CRM</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Keep every customer, deal and follow-up moving.</h2>
          <ul className="mt-8 space-y-3 text-navy-500">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-slate-200">{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-navy-500">© {new Date().getFullYear()} Mini CRM</p>
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 left-10 size-80 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo className="size-10" />
            <span className="text-lg font-bold">Mini CRM</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}

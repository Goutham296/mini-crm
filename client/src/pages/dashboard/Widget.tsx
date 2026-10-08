import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../components/ui/icons';

interface WidgetProps {
  title: string;
  viewAll?: string;
  className?: string;
  children: ReactNode;
}

/** Dashboard card with a title and an optional "View All" link. */
export function Widget({ title, viewAll, className = '', children }: WidgetProps) {
  return (
    <section className={`card flex flex-col overflow-hidden ${className}`}>
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {viewAll && (
          <Link to={viewAll} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All <ArrowRightIcon className="size-3.5" />
          </Link>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

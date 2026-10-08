import type { ReactNode } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EditIcon, MailIcon, PhoneIcon, TrashIcon } from '../../components/ui/icons';
import { formatDate, formatMoney } from '../../lib/format';
import type { Customer, Deal, Task } from '../../lib/types';

interface CustomerProfileProps {
  customer: Customer;
  deals: Deal[];
  tasks: Task[];
  onEdit: () => void;
  onDelete: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(110px,40%)_1fr] gap-3 px-5 py-3 text-sm sm:grid-cols-[180px_1fr]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children}</dd>
    </div>
  );
}

/** Customer header (avatar, name, contact) and the two-column label | value grid from the design. */
export function CustomerProfile({ customer, deals, tasks, onEdit, onDelete }: CustomerProfileProps) {
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const wonValue = deals.filter((d) => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const openTasks = tasks.filter((t) => !t.done).length;
  const overdue = tasks.filter((t) => t.overdue).length;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
        <Avatar name={customer.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold">{customer.name}</h2>
            <StatusBadge status={customer.status} />
          </div>
          <div className="mt-1 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="inline-flex min-w-0 items-center gap-1.5 hover:text-primary">
                <MailIcon className="size-4 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </a>
            )}
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <PhoneIcon className="size-4 shrink-0" />
                {customer.phone}
              </a>
            )}
            {!customer.email && !customer.phone && <span>No contact details yet</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <EditIcon className="size-4" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={onDelete} className="text-danger hover:bg-danger-50">
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </div>
      </div>
      <dl className="divide-y divide-line">
        <Row label="Company">{customer.company || '—'}</Row>
        <Row label="Status">
          <StatusBadge status={customer.status} />
        </Row>
        <Row label="Email">{customer.email || '—'}</Row>
        <Row label="Phone">{customer.phone || '—'}</Row>
        <Row label="Open pipeline">
          {formatMoney(openDeals.reduce((s, d) => s + d.value, 0))}{' '}
          <span className="font-normal text-muted">
            ({openDeals.length} open {openDeals.length === 1 ? 'deal' : 'deals'})
          </span>
        </Row>
        <Row label="Won">{formatMoney(wonValue)}</Row>
        <Row label="Open tasks">
          {openTasks}
          {overdue > 0 && <span className="ml-2 font-semibold text-danger">{overdue} overdue</span>}
        </Row>
        <Row label="Customer since">{formatDate(customer.createdAt)}</Row>
        <Row label="Notes">
          {customer.notes ? <span className="whitespace-pre-wrap font-normal">{customer.notes}</span> : '—'}
        </Row>
      </dl>
    </section>
  );
}

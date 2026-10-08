import { Link } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/Button';
import { EditIcon, TrashIcon } from '../../components/ui/icons';
import type { Customer } from '../../lib/types';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

function Actions({ customer, onEdit, onDelete }: { customer: Customer } & Omit<CustomerListProps, 'customers'>) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton label={`Edit ${customer.name}`} onClick={() => onEdit(customer)}>
        <EditIcon className="size-4" />
      </IconButton>
      <IconButton label={`Delete ${customer.name}`} tone="danger" onClick={() => onDelete(customer)}>
        <TrashIcon className="size-4" />
      </IconButton>
    </div>
  );
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs font-semibold uppercase tracking-wide text-muted">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Company</th>
            <th className="px-4 py-3 font-semibold">Phone</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-canvas/60">
              <td className="px-4 py-3">
                <Link to={`/customers/${c.id}`} className="group flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold group-hover:text-primary">{c.name}</span>
                    <span className="block truncate text-xs text-muted">{c.email || '—'}</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{c.company || '—'}</td>
              <td className="px-4 py-3 text-muted">{c.phone || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3">
                <Actions customer={c} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {customers.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <Link to={`/customers/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={c.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{c.name}</span>
                <span className="block truncate text-xs text-muted">{c.company || c.email || '—'}</span>
                <span className="mt-1 block">
                  <StatusBadge status={c.status} />
                </span>
              </span>
            </Link>
            <Actions customer={c} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
}

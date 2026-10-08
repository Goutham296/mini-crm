import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/toastContext';
import { ApiError, errorMessage } from '../../lib/api';
import { CUSTOMER_STATUSES } from '../../lib/constants';
import { customersApi, type CustomerInput } from '../../lib/resources';
import type { Customer } from '../../lib/types';
import { hasErrors, isEmail, isPhone, type Errors } from '../../lib/validation';

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

export function CustomerForm({ customer, onClose, onSaved }: CustomerFormProps) {
  const toast = useToast();
  const [form, setForm] = useState<CustomerInput>({
    name: customer?.name ?? '',
    company: customer?.company ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    status: customer?.status ?? 'lead',
    notes: customer?.notes ?? '',
  });
  const [errors, setErrors] = useState<Errors<keyof CustomerInput>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof CustomerInput) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<keyof CustomerInput> = {
      name: !form.name.trim() ? 'Name is required' : form.name.length > 100 ? 'Name is too long' : undefined,
      email: form.email.trim() && !isEmail(form.email) ? 'Enter a valid email address' : undefined,
      phone: !isPhone(form.phone) ? 'Phone may only contain digits, spaces and + ( ) - .' : undefined,
      notes: form.notes.length > 2000 ? 'Notes must be under 2000 characters' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      const body = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
      const saved = customer ? await customersApi.update(customer.id, body) : await customersApi.create(body);
      toast.success(customer ? 'Customer updated' : 'Customer added');
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors());
      setFormError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={customer ? 'Edit customer' : 'Add new customer'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={busy}>
            {customer ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger sm:col-span-2">{formError}</p>}
        <div className="sm:col-span-2">
          <TextField label="Name" required value={form.name} onChange={set('name')} error={errors.name} maxLength={100} />
        </div>
        <TextField label="Company" value={form.company} onChange={set('company')} error={errors.company} maxLength={100} />
        <SelectField label="Status" value={form.status} onChange={set('status')} error={errors.status}>
          {CUSTOMER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label="Phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={30} />
        <div className="sm:col-span-2">
          <TextAreaField label="Notes" value={form.notes} onChange={set('notes')} error={errors.notes} maxLength={2000} />
        </div>
      </form>
    </Modal>
  );
}

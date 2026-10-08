import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { SelectField, TextField } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/toastContext';
import { ApiError, errorMessage } from '../../lib/api';
import { DEAL_STAGES } from '../../lib/constants';
import { toDateInput } from '../../lib/format';
import { dealsApi, refId } from '../../lib/resources';
import type { Deal, DealStage } from '../../lib/types';
import { useCustomerOptions } from '../../lib/useOptions';
import { hasErrors, type Errors } from '../../lib/validation';

interface DealFormProps {
  deal?: Deal;
  /** Preselects (and locks) the customer, e.g. when adding from a customer page. */
  customerId?: string;
  defaultStage?: DealStage;
  onClose: () => void;
  onSaved: (deal: Deal) => void;
}

interface FormState {
  title: string;
  value: string;
  stage: DealStage;
  customer: string;
  expectedCloseDate: string;
}

export function DealForm({ deal, customerId, defaultStage = 'lead', onClose, onSaved }: DealFormProps) {
  const toast = useToast();
  const { customers, loading: loadingCustomers, error: customersError } = useCustomerOptions();
  const [form, setForm] = useState<FormState>({
    title: deal?.title ?? '',
    value: deal ? String(deal.value) : '',
    stage: deal?.stage ?? defaultStage,
    customer: deal ? refId(deal.customer) : customerId ?? '',
    expectedCloseDate: toDateInput(deal?.expectedCloseDate),
  });
  const [errors, setErrors] = useState<Errors<keyof FormState>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(form.value);
    const next: Errors<keyof FormState> = {
      title: !form.title.trim() ? 'Title is required' : form.title.length > 150 ? 'Title is too long' : undefined,
      value:
        form.value.trim() === '' ? 'Value is required' : !Number.isFinite(value) || value < 0 ? 'Enter a positive amount' : undefined,
      customer: !form.customer ? 'Choose a customer' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        value,
        stage: form.stage,
        customer: form.customer,
        expectedCloseDate: form.expectedCloseDate || null,
      };
      const saved = deal ? await dealsApi.update(deal.id, body) : await dealsApi.create(body);
      toast.success(deal ? 'Deal updated' : 'Deal added');
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors());
      setFormError(errorMessage(err));
      setBusy(false);
    }
  };

  const noCustomers = !loadingCustomers && !customersError && customers.length === 0;

  return (
    <Modal
      title={deal ? 'Edit deal' : 'Add new deal'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="deal-form" loading={busy} disabled={noCustomers}>
            {deal ? 'Save changes' : 'Add deal'}
          </Button>
        </>
      }
    >
      <form id="deal-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger sm:col-span-2">{formError}</p>}
        {noCustomers && (
          <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning sm:col-span-2">
            Add a customer first — every deal belongs to a customer.
          </p>
        )}
        <div className="sm:col-span-2">
          <TextField label="Title" required value={form.title} onChange={set('title')} error={errors.title} maxLength={150} />
        </div>
        <div className="sm:col-span-2">
          <SelectField
            label="Customer"
            required
            value={form.customer}
            onChange={set('customer')}
            error={errors.customer || (customersError ? 'Could not load customers' : undefined)}
            disabled={Boolean(customerId) || loadingCustomers}
          >
            <option value="">{loadingCustomers ? 'Loading customers…' : 'Select a customer'}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ''}
              </option>
            ))}
          </SelectField>
        </div>
        <TextField
          label="Value (USD)"
          required
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={form.value}
          onChange={set('value')}
          error={errors.value}
        />
        <SelectField label="Stage" value={form.stage} onChange={set('stage')} error={errors.stage}>
          {DEAL_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
        <div className="sm:col-span-2">
          <TextField
            label="Expected close date"
            type="date"
            value={form.expectedCloseDate}
            onChange={set('expectedCloseDate')}
            error={errors.expectedCloseDate}
          />
        </div>
      </form>
    </Modal>
  );
}

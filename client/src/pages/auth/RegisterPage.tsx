import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import { ApiError, errorMessage } from '../../lib/api';
import { hasErrors, isEmail, passwordProblem, type Errors } from '../../lib/validation';
import { AuthLayout, FormError } from './AuthLayout';

type Field = 'name' | 'email' | 'password' | 'confirm';

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key: Field) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<Field> = {
      name: form.name.trim() ? undefined : 'Name is required',
      email: !form.email.trim() ? 'Email is required' : !isEmail(form.email) ? 'Enter a valid email address' : undefined,
      password: passwordProblem(form.password),
      confirm: form.confirm !== form.password ? 'Passwords do not match' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created. Welcome to Mini CRM!');
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors());
      setFormError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking customers, deals and tasks.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <TextField label="Full name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" loading={busy} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

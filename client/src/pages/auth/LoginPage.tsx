import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { useAuth } from '../../context/authContext';
import { ApiError, errorMessage } from '../../lib/api';
import { hasErrors, isEmail, type Errors } from '../../lib/validation';
import { AuthLayout, FormError } from './AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors<'email' | 'password'>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<'email' | 'password'> = {
      email: !email.trim() ? 'Email is required' : !isEmail(email) ? 'Enter a valid email address' : undefined,
      password: !password ? 'Password is required' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (hasErrors(next)) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors());
      setFormError(err instanceof ApiError && err.status === 401 ? 'Incorrect email or password.' : errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your Mini CRM account.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="you@company.com"
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />
        <Button type="submit" loading={busy} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

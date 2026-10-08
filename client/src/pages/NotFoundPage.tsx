import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/layout/Logo';

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Mini CRM';
    return () => {
      document.title = 'Mini CRM';
    };
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo className="size-12" />
      <p className="mt-8 text-6xl font-extrabold tracking-tight text-primary">404</p>
      <h1 className="mt-3 text-xl font-bold">We couldn't find that page</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">The link may be broken, or the page may have been moved or deleted.</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
      >
        Back to dashboard
      </Link>
    </main>
  );
}

import { Logo } from './layout/Logo';
import { Spinner } from './ui/Spinner';

export function FullPageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" aria-busy="true" aria-label="Loading">
      <Logo className="size-12" />
      <Spinner className="size-6 text-primary" />
    </div>
  );
}

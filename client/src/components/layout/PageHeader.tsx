import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, SearchIcon } from '../ui/icons';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

interface PageHeaderProps {
  title: ReactNode;
  /** Primary action(s), e.g. the "Add New +" button. */
  actions?: ReactNode;
}

/** White top bar from the design: title left; action, search and avatar right. */
export function PageHeader({ title, actions }: PageHeaderProps) {
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setSearching(false);
    setQ('');
    navigate(term ? `/customers?search=${encodeURIComponent(term)}` : '/customers');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo className="size-8 md:hidden" />
        {searching ? (
          <form onSubmit={submit} className="flex flex-1 items-center gap-2" role="search">
            <SearchIcon className="size-5 text-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customers by name, company or email"
              aria-label="Search customers"
              className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button type="button" onClick={() => setSearching(false)} aria-label="Close search" className="p-1 text-muted hover:text-ink">
              <CloseIcon className="size-5" />
            </button>
          </form>
        ) : (
          <>
            <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            <div className="hidden sm:block">{actions}</div>
            <button
              type="button"
              onClick={() => setSearching(true)}
              aria-label="Search"
              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink"
            >
              <SearchIcon className="size-5" />
            </button>
          </>
        )}
        <UserMenu />
      </div>
      {actions && !searching && <div className="flex justify-end px-4 pb-3 sm:hidden">{actions}</div>}
    </header>
  );
}

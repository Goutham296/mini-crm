import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { DealsIcon, PlusIcon, TasksIcon, UsersIcon } from '../../components/ui/icons';

export type NewKind = 'customer' | 'deal' | 'task';

const OPTIONS: { kind: NewKind; label: string; icon: typeof UsersIcon }[] = [
  { kind: 'customer', label: 'Customer', icon: UsersIcon },
  { kind: 'deal', label: 'Deal', icon: DealsIcon },
  { kind: 'task', label: 'Task', icon: TasksIcon },
];

/** The dashboard's "Add New +" button: pick what to create. */
export function AddNewMenu({ onPick }: { onPick: (kind: NewKind) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        Add New <PlusIcon className="size-4" />
      </Button>
      {open && (
        <div role="menu" className="card absolute right-0 top-12 z-40 w-44 p-1.5">
          {OPTIONS.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onPick(kind);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-canvas"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

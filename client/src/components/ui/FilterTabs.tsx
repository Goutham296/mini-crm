interface FilterTabsProps<T extends string> {
  label: string;
  value: T | '';
  options: { value: T | ''; label: string }[];
  onChange: (value: T | '') => void;
}

/** Pill tabs for the main list filter; the selected value lives in the URL. */
export function FilterTabs<T extends string>({ label, value, options, onChange }: FilterTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`h-8 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors ${
              active ? 'bg-primary text-white shadow-sm' : 'bg-canvas text-muted hover:bg-primary-50 hover:text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

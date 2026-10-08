import { useEffect, useRef, useState } from 'react';
import { CloseIcon, SearchIcon } from './icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

/** Search box that keeps its own text and reports it debounced, so the URL isn't rewritten on every key. */
export function SearchInput({ value, onChange, placeholder = 'Search…', delay = 350 }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  // External changes (back button, cleared filters) replace the local text.
  if (value !== synced) {
    setSynced(value);
    setText(value);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const update = (next: string, immediate = false) => {
    setText(next);
    window.clearTimeout(timer.current);
    const send = () => {
      const trimmed = next.trim();
      setSynced(trimmed);
      if (trimmed !== value) onChange(trimmed);
    };
    if (immediate) send();
    else timer.current = window.setTimeout(send, delay);
  };

  return (
    <div className="relative w-full sm:max-w-xs">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={text}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-8 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => update('', true)}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

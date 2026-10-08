export function Logo({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#5b5bd6" />
      <path d="M21.5 11.2A7 7 0 1 0 21.5 20.8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

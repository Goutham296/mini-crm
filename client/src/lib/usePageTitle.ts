import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Mini CRM` : 'Mini CRM';
  }, [title]);
}

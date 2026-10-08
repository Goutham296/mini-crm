import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Filters live in the URL (?search=&status=&page=) so a refresh or shared link keeps them.
 * Changing any filter other than `page` resets to page 1.
 */
export function useUrlParams() {
  const [params, setParams] = useSearchParams();

  const get = useCallback((key: string) => params.get(key) ?? '', [params]);

  const set = useCallback(
    (changes: Record<string, string | number | null | undefined>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => {
            if (v === null || v === undefined || v === '' || (k === 'page' && Number(v) <= 1)) next.delete(k);
            else next.set(k, String(v));
          });
          if (!('page' in changes)) next.delete('page');
          return next;
        },
        { replace: false },
      );
    },
    [setParams],
  );

  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  return { params, get, set, page, key: params.toString() };
}

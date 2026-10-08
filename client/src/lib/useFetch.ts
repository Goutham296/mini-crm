import { useCallback, useEffect, useState } from 'react';

interface State<T> {
  key: string;
  data: T | undefined;
  error: Error | null;
}

/**
 * Minimal data loader. `key` identifies the request (e.g. the URL query); changing it reloads.
 * Loading is derived (the stored result belongs to an older key), so no state is set synchronously in the effect.
 */
export function useFetch<T>(key: string, loader: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<State<T>>({ key: '', data: undefined, error: null });
  const [nonce, setNonce] = useState(0);
  const fullKey = `${key}#${nonce}`;

  useEffect(() => {
    const ctrl = new AbortController();
    loader(ctrl.signal).then(
      (data) => setState({ key: fullKey, data, error: null }),
      (error: unknown) => {
        if (ctrl.signal.aborted) return;
        setState((s) => ({ key: fullKey, data: s.data, error: error instanceof Error ? error : new Error(String(error)) }));
      },
    );
    return () => ctrl.abort();
    // The loader is recreated every render; the key captures everything it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  /** Local update of the loaded data (optimistic changes). */
  const mutate = useCallback((fn: (prev: T) => T) => {
    setState((s) => (s.data === undefined ? s : { ...s, data: fn(s.data) }));
  }, []);

  const loading = state.key !== fullKey;
  return {
    data: state.data,
    error: loading ? null : state.error,
    loading,
    reload,
    mutate,
  };
}

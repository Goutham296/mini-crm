import { customersApi, dealsApi } from './resources';
import { useFetch } from './useFetch';

/** Customers for select inputs (up to 100, by name). */
export function useCustomerOptions() {
  const { data, error, loading } = useFetch('customer-options', (signal) => customersApi.options(signal));
  return { customers: data?.items ?? [], error, loading };
}

/** Deals for select inputs, optionally limited to one customer. */
export function useDealOptions(customerId: string) {
  const { data, error, loading } = useFetch(`deal-options:${customerId}`, (signal) =>
    dealsApi.list({ customer: customerId || undefined, limit: 100 }, signal),
  );
  return { deals: data?.items ?? [], error, loading };
}

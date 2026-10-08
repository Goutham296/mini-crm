export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export function skipFor(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit };
}

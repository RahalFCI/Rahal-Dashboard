import type { PagedResult } from '@/shared/api/types';

// Collects every primitive value reachable from `value` (up to `depth` levels
// of nested objects/arrays) so callers can substring-match across every
// field of a record without listing the fields by name.
function collectSearchableStrings(value: unknown, depth: number): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value).toLowerCase()];
  }
  if (depth <= 0) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectSearchableStrings(item, depth - 1));
  if (typeof value === 'object') return Object.values(value).flatMap((item) => collectSearchableStrings(item, depth - 1));
  return [];
}

// Case-insensitive substring match against every field of `record` (and one
// level of nested objects/arrays), so "1" matches "ABC1" and "abc" matches
// "ABC1" regardless of which field the match is in.
export function matchesQuery(record: object, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return collectSearchableStrings(record, 2).some((value) => value.includes(needle));
}

export function paginateClientSide<T>(items: T[], page: number, pageSize: number): PagedResult<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

import { describe, expect, it } from 'vitest';
import { matchesQuery, paginateClientSide } from './clientSearch';

describe('matchesQuery', () => {
  it('matches a substring anywhere in a field, case-insensitively', () => {
    const record = { name: 'ABC1', email: 'abc1@test.com' };

    expect(matchesQuery(record, 'ABC')).toBe(true);
    expect(matchesQuery(record, 'abc')).toBe(true);
    expect(matchesQuery(record, '1')).toBe(true);
    expect(matchesQuery(record, 'bc1')).toBe(true);
    expect(matchesQuery(record, 'xyz')).toBe(false);
  });

  it('searches across every field, not just one', () => {
    const record = { name: 'Nile Cafe', role: 'Vendor', categoryName: 'Restaurant' };

    expect(matchesQuery(record, 'vendor')).toBe(true);
    expect(matchesQuery(record, 'restaurant')).toBe(true);
  });

  it('searches one level into nested objects', () => {
    const record = { name: 'Karnak Temple', address: { city: 'Luxor', country: 'Egypt' } };

    expect(matchesQuery(record, 'luxor')).toBe(true);
    expect(matchesQuery(record, 'egypt')).toBe(true);
  });

  it('treats an empty query as matching everything', () => {
    expect(matchesQuery({ name: 'anything' }, '')).toBe(true);
    expect(matchesQuery({ name: 'anything' }, '   ')).toBe(true);
  });
});

describe('paginateClientSide', () => {
  it('slices items into the requested page', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    const page1 = paginateClientSide(items, 1, 10);
    expect(page1.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(page1).toMatchObject({ totalCount: 25, totalPages: 3, hasNextPage: true, hasPreviousPage: false });

    const page3 = paginateClientSide(items, 3, 10);
    expect(page3.items).toEqual([21, 22, 23, 24, 25]);
    expect(page3).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
  });

  it('handles an empty list without dividing by zero', () => {
    const result = paginateClientSide([], 1, 10);
    expect(result).toMatchObject({ items: [], totalCount: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false });
  });
});

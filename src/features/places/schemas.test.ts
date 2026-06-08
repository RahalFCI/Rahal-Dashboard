import { describe, expect, it } from 'vitest';
import { categorySchema, placeSchema } from './schemas';

describe('place schemas', () => {
  it('validates place form values', () => {
    const result = placeSchema.safeParse({
      name: 'Museum',
      description: 'Historic place record',
      placeCategoryId: '11111111-1111-4111-8111-111111111111',
      ticketPrice: '25',
      latitude: '30.0444',
      longitude: '31.2357',
      geoFenceRange: '50',
      address: {
        addressLine: 'Tahrir Square',
        government: 'Cairo',
        city: 'Cairo',
        country: 'Egypt',
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects incomplete categories', () => {
    expect(categorySchema.safeParse({ name: '', description: '' }).success).toBe(false);
  });
});

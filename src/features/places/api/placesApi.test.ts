import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { getPlacesByCategory, searchPlacesByLocation } from './placesApi';

describe('placesApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests places scoped to a category with pagination params', async () => {
    const pagedResult = {
      items: [
        {
          id: 'place-1',
          name: 'Karnak Temple',
          description: 'Ancient temple complex',
          placeCategoryId: 'cat-1',
          categoryName: 'Historic',
          ticketPrice: 450,
          latitude: 25.7188,
          longitude: 32.6573,
          geoFenceRange: 100,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: pagedResult, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getPlacesByCategory('cat-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/place/category/cat-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(pagedResult);
  });

  it('throws a NOT_FOUND ApiError when the category does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getPlacesByCategory('missing-category', 1, 10)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('sends location search params as query params on a POST request', async () => {
    const pagedResult = {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: pagedResult, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await searchPlacesByLocation({ latitude: 30.0444, longitude: 31.2357, radiusInMeters: 5000, page: 1, pageSize: 10 });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/place/search',
      params: {
        Latitude: 30.0444,
        Longitude: 31.2357,
        RadiusInMeters: 5000,
        'offsetPaginationRequest.Page': 1,
        'offsetPaginationRequest.PageSize': 10,
      },
    });
  });

  it('throws a VALIDATION_FAILED ApiError for out-of-range coordinates', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'ValidationError' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await expect(
      searchPlacesByLocation({ latitude: 999, longitude: 999, radiusInMeters: 5000, page: 1, pageSize: 10 }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  deleteReview,
  getReview,
  getReviewsByExplorerId,
  getReviewsByPlaceId,
  getVerifiedReviewsByPlaceId,
} from './placeReviewApi';

describe('placeReviewApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a single review by explorerId/placeId/checkInId', async () => {
    const review = {
      explorerId: 'explorer-1',
      placeId: 'place-1',
      checkInId: 'checkin-1',
      rating: 5,
      comment: 'Beautiful place, loved it!',
      isVerified: true,
      placeName: 'Pyramids of Giza',
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: review, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getReview('explorer-1', 'place-1', 'checkin-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/PlaceReview/explorer-1/place-1/checkin-1' });
    expect(result).toEqual(review);
  });

  it('throws a NOT_FOUND ApiError when no review matches the given keys', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getReview('explorer-1', 'place-1', 'missing-checkin')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists reviews for a place', async () => {
    const reviews = [
      {
        explorerId: 'explorer-1',
        placeId: 'place-1',
        checkInId: 'checkin-1',
        rating: 5,
        comment: 'Beautiful place, loved it!',
        isVerified: true,
        placeName: 'Pyramids of Giza',
      },
    ];
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: reviews, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getReviewsByPlaceId('place-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/PlaceReview/place/place-1' });
    expect(result).toEqual(reviews);
  });

  it('throws a NOT_FOUND ApiError when the place does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getReviewsByPlaceId('missing-place')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists verified reviews for a place', async () => {
    const reviews = [
      {
        explorerId: 'explorer-1',
        placeId: 'place-1',
        checkInId: 'checkin-1',
        rating: 5,
        comment: 'Beautiful place, loved it!',
        isVerified: true,
        placeName: 'Pyramids of Giza',
      },
    ];
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: reviews, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getVerifiedReviewsByPlaceId('place-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/PlaceReview/verified/place-1' });
    expect(result).toEqual(reviews);
  });

  it('throws a NOT_FOUND ApiError when fetching verified reviews for a place that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getVerifiedReviewsByPlaceId('missing-place')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists reviews written by a specific explorer', async () => {
    const reviews = [
      {
        explorerId: 'explorer-1',
        placeId: 'place-1',
        checkInId: 'checkin-1',
        rating: 4,
        comment: 'Great visit overall.',
        isVerified: false,
        placeName: 'Egyptian Museum',
      },
    ];
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: reviews, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getReviewsByExplorerId('explorer-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/PlaceReview/explorer/explorer-1' });
    expect(result).toEqual(reviews);
  });

  it('returns an empty array when the explorer has no reviews', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: [], errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getReviewsByExplorerId('explorer-with-no-reviews');

    expect(result).toEqual([]);
  });

  it('deletes a review by explorerId/placeId/checkInId', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Review deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteReview('explorer-1', 'place-1', 'checkin-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/PlaceReview/explorer-1/place-1/checkin-1' });
    expect(result).toBe('Review deleted successfully');
  });

  it('throws a NOT_FOUND ApiError when deleting a review that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteReview('explorer-1', 'place-1', 'missing-checkin')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

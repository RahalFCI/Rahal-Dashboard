import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  deleteChallenge,
  getChallengeByName,
  getChallengeById,
  getChallengesByPlaceId,
  listChallenges,
  restoreChallenge,
} from './challengeApi';

describe('challengeApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists challenges with page and pageSize params', async () => {
    const page = {
      items: [
        {
          id: 'ch-1',
          placeId: 'place-1',
          name: 'Photograph the Great Sphinx',
          description: 'Take a clear photo of the Sphinx',
          validationPrompt: 'Does this photo clearly show the Great Sphinx?',
          type: 'Photo',
          difficulty: 'Medium',
          minimumLevelRequired: 1,
          xpReward: 30,
          isActive: true,
          createdAt: '2026-06-19T20:30:15Z',
          updatedAt: null,
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
      data: { isSuccess: true, data: page, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await listChallenges(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/Challenge',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('throws an UNAUTHORIZED ApiError when the session token is missing or expired', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'Unauthorized' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {},
    });

    await expect(listChallenges(1, 10)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('sends a delete as DELETE to the id-scoped URL', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Challenge deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteChallenge('ch-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/Challenge/ch-1' });
    expect(result).toBe('Challenge deleted successfully');
  });

  it('throws a NOT_FOUND ApiError when deleting an id that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteChallenge('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('sends a restore as POST to the id-scoped restore URL', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Challenge restored successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await restoreChallenge('ch-1');

    expect(request).toHaveBeenCalledWith({ method: 'POST', url: '/Challenge/ch-1/restore' });
    expect(result).toBe('Challenge restored successfully');
  });

  it('throws a NOT_FOUND ApiError restoring an id that is not currently soft-deleted', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(restoreChallenge('not-deleted-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single challenge by id', async () => {
    const challenge = {
      id: 'ch-1',
      placeId: 'place-1',
      name: 'Photograph the Great Sphinx',
      description: 'Take a clear photo of the Sphinx',
      validationPrompt: 'Does this photo clearly show the Great Sphinx?',
      type: 'Photo',
      difficulty: 'Medium',
      minimumLevelRequired: 1,
      xpReward: 30,
      isActive: true,
      createdAt: '2026-06-19T20:30:15Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: challenge, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getChallengeById('ch-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/Challenge/ch-1' });
    expect(result).toEqual(challenge);
  });

  it('throws a NOT_FOUND ApiError when the id does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getChallengeById('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists challenges for one place, scoped by placeId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'ch-1',
          placeId: 'place-1',
          name: 'Photograph the Great Sphinx',
          description: 'Take a clear photo of the Sphinx',
          validationPrompt: 'Does this photo clearly show the Great Sphinx?',
          type: 'Photo',
          difficulty: 'Medium',
          minimumLevelRequired: 1,
          xpReward: 30,
          isActive: true,
          createdAt: '2026-06-19T20:30:15Z',
          updatedAt: null,
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
      data: { isSuccess: true, data: page, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getChallengesByPlaceId('place-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/Challenge/place/place-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the place has no challenges', async () => {
    const emptyPage = {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: emptyPage, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getChallengesByPlaceId('place-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });

  it('fetches a single challenge by exact name, URL-encoding it', async () => {
    const challenge = {
      id: 'ch-1',
      placeId: 'place-1',
      name: 'Photograph the Great Sphinx',
      description: 'Take a clear photo of the Sphinx',
      validationPrompt: 'Does this photo clearly show the Great Sphinx?',
      type: 'Photo',
      difficulty: 'Medium',
      minimumLevelRequired: 1,
      xpReward: 30,
      isActive: true,
      createdAt: '2026-06-19T20:30:15Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: challenge, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getChallengeByName('Photograph the Great Sphinx');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/Challenge/name/Photograph%20the%20Great%20Sphinx' });
    expect(result).toEqual(challenge);
  });

  it('throws a NOT_FOUND ApiError when no challenge matches the name', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getChallengeByName('Nonexistent')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

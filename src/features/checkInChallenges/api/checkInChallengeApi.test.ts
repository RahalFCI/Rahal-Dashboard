import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  getCheckInChallengeById,
  getCheckInChallengesByChallengeId,
  getCheckInChallengesByCheckInId,
} from './checkInChallengeApi';

describe('checkInChallengeApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a single check-in challenge by id', async () => {
    const challenge = {
      id: 'cic-1',
      challengeId: 'ch-1',
      challengeName: 'Visit 3 Museums',
      checkInId: 'checkin-1',
      explorerId: 'explorer-1',
      proofMediaUrl: 'https://example.com/proof.jpg',
      validationStatus: 'Pending',
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: challenge, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getCheckInChallengeById('cic-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/CheckInChallenge/cic-1' });
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

    await expect(getCheckInChallengeById('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists check-in challenges for one check-in, scoped by checkInId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'cic-1',
          challengeId: 'ch-1',
          challengeName: 'Visit 3 Museums',
          checkInId: 'checkin-1',
          explorerId: 'explorer-1',
          proofMediaUrl: null,
          validationStatus: 'Pending',
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

    const result = await getCheckInChallengesByCheckInId('checkin-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckInChallenge/checkin/checkin-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the check-in has no challenges', async () => {
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

    const result = await getCheckInChallengesByCheckInId('checkin-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });

  it('lists check-in challenges for one challenge, scoped by challengeId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'cic-1',
          challengeId: 'ch-1',
          challengeName: 'Visit 3 Museums',
          checkInId: 'checkin-1',
          explorerId: 'explorer-1',
          proofMediaUrl: null,
          validationStatus: 'Approved',
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

    const result = await getCheckInChallengesByChallengeId('ch-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckInChallenge/challenge/ch-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the challenge has no attempts', async () => {
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

    const result = await getCheckInChallengesByChallengeId('ch-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });
});

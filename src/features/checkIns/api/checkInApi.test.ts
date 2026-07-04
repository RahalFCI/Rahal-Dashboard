import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { getCheckIn, getCheckInsByExplorerId, getCheckInsByPlace, getPendingCheckIns, listCheckIns } from './checkInApi';

describe('checkInApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists check-ins with page and pageSize params', async () => {
    const page = {
      items: [
        {
          explorerId: 'explorer-1',
          placeId: 'place-1',
          validationStatus: 1,
          placeName: '',
          validationStatusName: 'Verified',
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

    const result = await listCheckIns(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckIn',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('throws a FORBIDDEN ApiError when the caller is not an Admin', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: {},
    });

    await expect(listCheckIns(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('fetches a single check-in by explorerId and placeId, with placeName populated', async () => {
    const checkIn = {
      explorerId: 'explorer-1',
      placeId: 'place-1',
      validationStatus: 1,
      placeName: 'Tahrir Square',
      validationStatusName: 'Verified',
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: checkIn, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getCheckIn('explorer-1', 'place-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/CheckIn/explorer-1/place-1' });
    expect(result).toEqual(checkIn);
  });

  it('throws a NOT_FOUND ApiError when no check-in exists for that pair', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getCheckIn('explorer-1', 'missing-place')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists check-ins for one place, scoped by placeId in the URL', async () => {
    const page = {
      items: [
        {
          explorerId: 'explorer-1',
          placeId: 'place-1',
          validationStatus: 1,
          placeName: '',
          validationStatusName: 'Verified',
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

    const result = await getCheckInsByPlace('place-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckIn/place/place-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('throws a NOT_FOUND ApiError when the place does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getCheckInsByPlace('missing-place', 1, 10)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('lists check-ins for one explorer, scoped by explorerId in the URL', async () => {
    const page = {
      items: [
        {
          explorerId: 'explorer-1',
          placeId: 'place-1',
          validationStatus: 1,
          placeName: '',
          validationStatusName: 'Verified',
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

    const result = await getCheckInsByExplorerId('explorer-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckIn/explorer/explorer-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the explorer has no check-ins', async () => {
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

    const result = await getCheckInsByExplorerId('explorer-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });

  it('lists pending check-ins with page and pageSize params', async () => {
    const page = {
      items: [
        {
          explorerId: 'explorer-1',
          placeId: 'place-1',
          validationStatus: 0,
          placeName: '',
          validationStatusName: 'Pending',
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

    const result = await getPendingCheckIns(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/CheckIn/pending',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('throws a FORBIDDEN ApiError when the caller is not an Admin', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: {},
    });

    await expect(getPendingCheckIns(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

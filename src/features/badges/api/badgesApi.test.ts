import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { createBadge, deleteBadge, getBadgeById, getBadgeByName, listBadges, restoreBadge, updateBadge } from './badgesApi';

describe('badgesApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists badges with page and pageSize params', async () => {
    const page = {
      items: [
        {
          id: 'badge-1',
          name: 'Early Explorer',
          description: 'Awarded for checking in to 5 places.',
          imageUrl: 'https://example.com/badge.png',
          createdAt: '2026-06-01T10:00:00Z',
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

    const result = await listBadges(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/Badge',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('throws a FORBIDDEN ApiError when the caller is not authorized', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: {},
    });

    await expect(listBadges(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('fetches a single badge by id', async () => {
    const badge = {
      id: 'badge-1',
      name: 'Early Explorer',
      description: 'Awarded for checking in to 5 places.',
      imageUrl: 'https://example.com/badge.png',
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: badge, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getBadgeById('badge-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/Badge/badge-1' });
    expect(result).toEqual(badge);
  });

  it('throws a NOT_FOUND ApiError when fetching a badge that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getBadgeById('missing-badge')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single badge by exact name, URL-encoding it', async () => {
    const badge = {
      id: 'badge-1',
      name: 'Early Explorer & Friend',
      description: 'Awarded for checking in to 5 places.',
      imageUrl: 'https://example.com/badge.png',
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: badge, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getBadgeByName('Early Explorer & Friend');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/Badge/name/Early%20Explorer%20%26%20Friend' });
    expect(result).toEqual(badge);
  });

  it('throws a NOT_FOUND ApiError when no badge matches the name', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getBadgeByName('Nonexistent')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('creates a badge as a JSON body, matching the [FromBody] binding on CreateBadgeAsync', async () => {
    const created = {
      id: 'badge-1',
      name: 'Early Explorer',
      description: 'Awarded for checking in to 5 places.',
      imageUrl: '',
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: created, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await createBadge({ name: 'Early Explorer', description: 'Awarded for checking in to 5 places.' });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/Badge',
      data: { name: 'Early Explorer', description: 'Awarded for checking in to 5 places.' },
    });
    expect(result).toEqual(created);
  });

  it('throws an ALREADY_EXISTS-mapped ApiError when a badge with the same name exists', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {},
    });

    await expect(createBadge({ name: 'Early Explorer', description: 'Dup.' })).rejects.toMatchObject({ status: 409 });
  });

  it('updates a badge as a JSON body, matching the [FromBody] binding on UpdateBadgeAsync', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Badge updated successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await updateBadge('badge-1', { name: 'Renamed Badge', description: 'New description.' });

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/Badge/badge-1',
      data: { name: 'Renamed Badge', description: 'New description.' },
    });
    expect(result).toBe('Badge updated successfully');
  });

  it('throws a NOT_FOUND ApiError when updating a badge that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(updateBadge('missing-badge', { name: 'X', description: 'Y' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws an ALREADY_EXISTS-mapped ApiError when updating a badge to a name that already exists', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {},
    });

    await expect(updateBadge('badge-1', { name: 'Dup', description: 'Y' })).rejects.toMatchObject({ status: 409 });
  });

  it('deletes a badge by id', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Badge deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteBadge('badge-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/Badge/badge-1' });
    expect(result).toBe('Badge deleted successfully');
  });

  it('throws a NOT_FOUND ApiError when deleting a badge that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteBadge('missing-badge')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('restores a soft-deleted badge by id', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Badge restored successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await restoreBadge('badge-1');

    expect(request).toHaveBeenCalledWith({ method: 'POST', url: '/Badge/badge-1/restore' });
    expect(result).toBe('Badge restored successfully');
  });

  it('throws a NOT_FOUND ApiError when restoring a badge that is not currently deleted', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(restoreBadge('badge-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

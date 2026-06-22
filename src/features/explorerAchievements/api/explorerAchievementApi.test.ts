import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  deleteExplorerAchievement,
  getExplorerAchievementById,
  getExplorerAchievementsByAchievementId,
  getExplorerAchievementsByExplorerId,
  listExplorerAchievements,
  restoreExplorerAchievement,
} from './explorerAchievementApi';

describe('explorerAchievementApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists explorer achievements with page and pageSize params', async () => {
    const page = {
      items: [
        {
          id: 'ea-1',
          achievementId: 'ach-1',
          achievementTitle: 'First Check-In',
          explorerId: 'explorer-1',
          earnedAt: '2026-06-18T10:00:00Z',
          isNotified: true,
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

    const result = await listExplorerAchievements(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/ExplorerAchievement',
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

    await expect(listExplorerAchievements(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lists achievements for one explorer, scoped by explorerId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'ea-1',
          achievementId: 'ach-1',
          achievementTitle: 'First Check-In',
          explorerId: 'explorer-1',
          earnedAt: '2026-06-18T10:00:00Z',
          isNotified: true,
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

    const result = await getExplorerAchievementsByExplorerId('explorer-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/ExplorerAchievement/explorer/explorer-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the explorer has earned nothing', async () => {
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

    const result = await getExplorerAchievementsByExplorerId('explorer-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });

  it('lists explorers who earned one achievement, scoped by achievementId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'ea-1',
          achievementId: 'ach-1',
          achievementTitle: 'First Check-In',
          explorerId: 'explorer-1',
          earnedAt: '2026-06-18T10:00:00Z',
          isNotified: true,
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

    const result = await getExplorerAchievementsByAchievementId('ach-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/ExplorerAchievement/achievement/ach-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when nobody has earned the achievement', async () => {
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

    const result = await getExplorerAchievementsByAchievementId('ach-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });

  it('sends a delete as DELETE to the id-scoped URL', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Explorer achievement deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteExplorerAchievement('ea-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/ExplorerAchievement/ea-1' });
    expect(result).toBe('Explorer achievement deleted successfully');
  });

  it('throws a NOT_FOUND ApiError when deleting an id that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteExplorerAchievement('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('sends a restore as POST to the id-scoped restore URL', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Explorer achievement restored successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await restoreExplorerAchievement('ea-1');

    expect(request).toHaveBeenCalledWith({ method: 'POST', url: '/ExplorerAchievement/ea-1/restore' });
    expect(result).toBe('Explorer achievement restored successfully');
  });

  it('throws a NOT_FOUND ApiError restoring an id that is not currently soft-deleted', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(restoreExplorerAchievement('not-deleted-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single explorer achievement by its own id', async () => {
    const earned = {
      id: 'ea-1',
      achievementId: 'ach-1',
      achievementTitle: 'First Check-In',
      explorerId: 'explorer-1',
      earnedAt: '2026-06-18T10:00:00Z',
      isNotified: true,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: earned, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getExplorerAchievementById('ea-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/ExplorerAchievement/ea-1' });
    expect(result).toEqual(earned);
  });

  it('throws a NOT_FOUND ApiError when the id does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getExplorerAchievementById('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

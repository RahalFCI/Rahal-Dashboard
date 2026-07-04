import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { getUserStatsByExplorerId, listUserStats } from './userStatsApi';

describe('userStatsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists user stats with page and pageSize params', async () => {
    const page = {
      items: [
        {
          id: 'stat-1',
          explorerId: 'explorer-1',
          availableXp: 120,
          cumulativeXp: 540,
          currentStreak: 3,
          lastActivityDate: '2026-06-18T10:00:00Z',
          totalCheckIns: 12,
          totalChallengesCompleted: 4,
          totalAchievementsEarned: 2,
          totalBadgesEarned: 1,
          longestStreak: 7,
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

    const result = await listUserStats(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/UserStats',
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

    await expect(listUserStats(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('fetches a single explorer\'s stats by explorerId (ExplorerProfile.Id)', async () => {
    const stat = {
      id: 'stat-1',
      explorerId: 'explorer-1',
      availableXp: 120,
      cumulativeXp: 540,
      currentStreak: 3,
      lastActivityDate: '2026-06-18T10:00:00Z',
      totalCheckIns: 12,
      totalChallengesCompleted: 4,
      totalAchievementsEarned: 2,
      totalBadgesEarned: 1,
      longestStreak: 7,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: stat, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getUserStatsByExplorerId('explorer-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/UserStats/explorer-1' });
    expect(result).toEqual(stat);
  });

  it('throws a NOT_FOUND ApiError when the explorer has no stats row', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getUserStatsByExplorerId('missing-explorer')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

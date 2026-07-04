import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  createAchievement,
  createCriteriaType,
  deleteAchievement,
  deleteCriteriaType,
  getAchievementById,
  getCriteriaTypeById,
  getCriteriaTypeByName,
  listAchievements,
  listCriteriaTypes,
  restoreAchievement,
  updateAchievement,
  updateCriteriaType,
} from './achievementApi';

describe('achievementApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists achievements with page and pageSize params', async () => {
    const page = {
      items: [
        {
          id: 'achievement-1',
          title: 'Early Explorer',
          description: 'Check in to 5 places.',
          badgeId: 'badge-1',
          badgeName: 'Early Explorer Badge',
          xpReward: 100,
          criteriaTypeId: 'criteria-1',
          criteriaCode: 'CheckInCount',
          criteriaThreshold: 5,
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

    const result = await listAchievements(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/Achievement',
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

    await expect(listAchievements(1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('fetches a single achievement by id', async () => {
    const achievement = {
      id: 'achievement-1',
      title: 'Early Explorer',
      description: 'Check in to 5 places.',
      badgeId: 'badge-1',
      badgeName: 'Early Explorer Badge',
      xpReward: 100,
      criteriaTypeId: 'criteria-1',
      criteriaCode: 'CheckInCount',
      criteriaThreshold: 5,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: null,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: achievement, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getAchievementById('achievement-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/Achievement/achievement-1' });
    expect(result).toEqual(achievement);
  });

  it('throws a NOT_FOUND ApiError when fetching an achievement that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getAchievementById('missing-achievement')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('creates an achievement as a JSON body, sending null for an unset badge', async () => {
    const created = {
      id: 'achievement-1',
      title: 'Early Explorer',
      description: 'Check in to 5 places.',
      badgeId: null,
      badgeName: '',
      xpReward: 100,
      criteriaTypeId: 'criteria-1',
      criteriaCode: 'CheckInCount',
      criteriaThreshold: 5,
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

    const result = await createAchievement({
      title: 'Early Explorer',
      description: 'Check in to 5 places.',
      badgeId: '',
      xpReward: 100,
      criteriaTypeId: 'criteria-1',
      criteriaThreshold: 5,
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/Achievement',
      data: {
        title: 'Early Explorer',
        description: 'Check in to 5 places.',
        badgeId: null,
        xpReward: 100,
        criteriaTypeId: 'criteria-1',
        criteriaThreshold: 5,
      },
    });
    expect(result).toEqual(created);
  });

  it('creates an achievement with a badgeId when one is selected', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: {}, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await createAchievement({
      title: 'Early Explorer',
      description: 'Check in to 5 places.',
      badgeId: 'badge-1',
      xpReward: 100,
      criteriaTypeId: 'criteria-1',
      criteriaThreshold: 5,
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ badgeId: 'badge-1' }) }),
    );
  });

  it('throws a NOT_FOUND ApiError when the criteria type does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(
      createAchievement({
        title: 'Early Explorer',
        description: 'Check in to 5 places.',
        badgeId: '',
        xpReward: 100,
        criteriaTypeId: 'missing-criteria',
        criteriaThreshold: 5,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws an ALREADY_EXISTS-mapped ApiError when an achievement with the same title exists', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {},
    });

    await expect(
      createAchievement({
        title: 'Early Explorer',
        description: 'Dup.',
        badgeId: '',
        xpReward: 100,
        criteriaTypeId: 'criteria-1',
        criteriaThreshold: 5,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('updates an achievement as a JSON body, matching the [FromBody] binding on UpdateAchievementAsync', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Achievement updated successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await updateAchievement('achievement-1', {
      title: 'Renamed Achievement',
      description: 'New description.',
      badgeId: 'badge-1',
      xpReward: 75,
      criteriaTypeId: 'criteria-1',
      criteriaThreshold: 3,
    });

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/Achievement/achievement-1',
      data: {
        title: 'Renamed Achievement',
        description: 'New description.',
        badgeId: 'badge-1',
        xpReward: 75,
        criteriaTypeId: 'criteria-1',
        criteriaThreshold: 3,
      },
    });
    expect(result).toBe('Achievement updated successfully');
  });

  it('throws a NOT_FOUND ApiError when updating an achievement that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(
      updateAchievement('missing-achievement', {
        title: 'X',
        description: 'Y',
        badgeId: 'badge-1',
        xpReward: 0,
        criteriaTypeId: 'criteria-1',
        criteriaThreshold: 1,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws an ALREADY_EXISTS-mapped ApiError when updating an achievement to a title that already exists', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {},
    });

    await expect(
      updateAchievement('achievement-1', {
        title: 'Dup',
        description: 'Y',
        badgeId: 'badge-1',
        xpReward: 0,
        criteriaTypeId: 'criteria-1',
        criteriaThreshold: 1,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('lists criteria types without pagination params', async () => {
    const criteriaTypes = [{ id: 'criteria-1', name: 'CheckInCount', description: 'Number of check-ins' }];
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: criteriaTypes, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await listCriteriaTypes();

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/AchievementCriteriaType' });
    expect(result).toEqual(criteriaTypes);
  });

  it('deletes an achievement by id', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Achievement deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteAchievement('achievement-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/Achievement/achievement-1' });
    expect(result).toBe('Achievement deleted successfully');
  });

  it('throws a NOT_FOUND ApiError when deleting an achievement that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteAchievement('missing-achievement')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('restores a soft-deleted achievement by id', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Achievement restored successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await restoreAchievement('achievement-1');

    expect(request).toHaveBeenCalledWith({ method: 'POST', url: '/Achievement/achievement-1/restore' });
    expect(result).toBe('Achievement restored successfully');
  });

  it('throws a NOT_FOUND ApiError when restoring an achievement that is not currently deleted', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(restoreAchievement('achievement-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('creates a criteria type as a JSON body', async () => {
    const created = { id: 'criteria-2', name: 'Total Reviews', description: 'Total number of reviews left' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: created, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await createCriteriaType({ name: 'Total Reviews', description: 'Total number of reviews left' });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/AchievementCriteriaType',
      data: { name: 'Total Reviews', description: 'Total number of reviews left' },
    });
    expect(result).toEqual(created);
  });

  it('throws an ALREADY_EXISTS-mapped ApiError when a criteria type with the same name exists', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {},
    });

    await expect(createCriteriaType({ name: 'Total XP', description: 'Dup.' })).rejects.toMatchObject({ status: 409 });
  });

  it('updates a criteria type as a JSON body', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Achievement criteria type updated successfully. ID: criteria-1', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await updateCriteriaType('criteria-1', { name: 'Total Reviews', description: 'Updated description.' });

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/AchievementCriteriaType/criteria-1',
      data: { name: 'Total Reviews', description: 'Updated description.' },
    });
    expect(result).toBe('Achievement criteria type updated successfully. ID: criteria-1');
  });

  it('throws a NOT_FOUND ApiError when updating a criteria type that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(
      updateCriteriaType('missing-criteria', { name: 'X', description: 'Y' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single criteria type by id', async () => {
    const criteriaType = { id: 'criteria-1', name: 'CheckInCount', description: 'Number of check-ins' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: criteriaType, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getCriteriaTypeById('criteria-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/AchievementCriteriaType/criteria-1' });
    expect(result).toEqual(criteriaType);
  });

  it('throws a NOT_FOUND ApiError when fetching a criteria type that does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getCriteriaTypeById('missing-criteria')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single criteria type by exact name, URL-encoding it', async () => {
    const criteriaType = { id: 'criteria-1', name: 'Check-In Count', description: 'Number of place check-ins completed' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: criteriaType, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getCriteriaTypeByName('Check-In Count');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/AchievementCriteriaType/name/Check-In%20Count' });
    expect(result).toEqual(criteriaType);
  });

  it('throws a NOT_FOUND ApiError when no criteria type matches the name', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getCriteriaTypeByName('Nonexistent')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('calls DELETE /AchievementCriteriaType/{id} with the right shape', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Achievement criteria type deleted successfully', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await deleteCriteriaType('criteria-1');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/AchievementCriteriaType/criteria-1' });
  });

  // This is the REAL, confirmed-live behavior for every currently-active
  // criteria type, not an edge case: the backend handler only matches rows
  // where IsDeleted is already true, and nothing in this resource's API ever
  // sets that flag. See the comment on deleteCriteriaType.
  it('throws a NOT_FOUND ApiError when deleting any currently-active criteria type', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteCriteriaType('any-active-criteria-type-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

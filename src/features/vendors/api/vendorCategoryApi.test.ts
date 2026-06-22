import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import {
  createVendorCategory,
  deleteVendorCategory,
  getVendorCategoryById,
  getVendorCategoryByName,
  listVendorCategories,
  updateVendorCategory,
} from './vendorCategoryApi';

describe('vendorCategoryApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists vendor categories', async () => {
    const categories = [{ id: 'cat-1', name: 'Restaurant' }];
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: categories, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await listVendorCategories();

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/VendorCategory' });
    expect(result).toEqual(categories);
  });

  it('fetches a single vendor category by id', async () => {
    const category = { id: 'cat-1', name: 'Restaurant' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: category, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getVendorCategoryById('cat-1');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/VendorCategory/cat-1' });
    expect(result).toEqual(category);
  });

  it('throws a NOT_FOUND ApiError when the category id does not exist', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getVendorCategoryById('missing-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('fetches a single vendor category by exact name, URL-encoding it', async () => {
    const category = { id: 'cat-3', name: 'Amusement Parks' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: category, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getVendorCategoryByName('Amusement Parks');

    expect(request).toHaveBeenCalledWith({ method: 'GET', url: '/VendorCategory/name/Amusement%20Parks' });
    expect(result).toEqual(category);
  });

  it('throws a NOT_FOUND ApiError when no category matches the name', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'NotFound' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(getVendorCategoryByName('Nonexistent')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('sends the category name as a raw JSON string body, not a wrapped object', async () => {
    const created = { id: 'cat-2', name: 'Cafe' };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: created, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await createVendorCategory('Cafe');

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/VendorCategory',
      data: '"Cafe"',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(created);
  });

  it('throws an ALREADY_EXISTS ApiError when the category name is taken', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, errorCode: 'AlreadyExists' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await expect(createVendorCategory('Restaurant')).rejects.toMatchObject({ code: 'ALREADY_EXISTS' });
  });

  it('sends an update as PUT with the id in the URL and the name as a raw JSON string body', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Category updated successfully. ID: cat-2', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await updateVendorCategory('cat-2', 'Cafe & Bakery');

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/VendorCategory/cat-2',
      data: '"Cafe & Bakery"',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toBe('Category updated successfully. ID: cat-2');
  });

  // Documents a confirmed backend bug (not fixed here): the controller binds
  // the route id into a parameter named `CategoryId` while the route template
  // is `{id}`, so the id never binds and this fails for every category,
  // always with errorCode "AlreadyExists". Verified against the live backend.
  it('surfaces the backend AlreadyExists failure on update (currently always fails)', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {},
    });

    await expect(updateVendorCategory('cat-2', 'Cafe & Bakery')).rejects.toMatchObject({ code: 'ALREADY_EXISTS' });
  });

  it('sends a delete as DELETE to the id-scoped URL', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: 'Category deleted successfully.', errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await deleteVendorCategory('cat-2');

    expect(request).toHaveBeenCalledWith({ method: 'DELETE', url: '/VendorCategory/cat-2' });
    expect(result).toBe('Category deleted successfully.');
  });

  it('maps a delete-not-found response (backend mislabels it AlreadyExists) to ALREADY_EXISTS', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'AlreadyExists' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
    });

    await expect(deleteVendorCategory('missing-id')).rejects.toMatchObject({ code: 'ALREADY_EXISTS' });
  });
});

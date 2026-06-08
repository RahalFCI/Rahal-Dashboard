import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { updateVendorProfile, updateVendorProfilePicture } from './vendorProfileApi';

function mockApiResponse() {
  return vi.spyOn(axiosInstance, 'request').mockResolvedValue({
    data: { isSuccess: true, data: 'ok', errorCode: 'None' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });
}

describe('vendorProfileApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends vendor profile updates as form data', async () => {
    const request = mockApiResponse();

    await updateVendorProfile('vendor-1', {
      userId: 'vendor-1',
      displayName: 'Vendor One',
      profilePictureUrl: '',
      countryCode: 'EG',
      address: 'Cairo',
      addressUrl: 'https://maps.example.com/vendor',
      categoryId: '11111111-1111-1111-1111-111111111111',
      workingHours: { Monday: '09:00-17:00' },
    });

    const config = request.mock.calls[0][0];
    const formData = config.data as FormData;

    expect(config.method).toBe('PUT');
    expect(config.url).toBe('/VendorProfile/vendor-1');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('UserId')).toBe('vendor-1');
    expect(formData.get('DisplayName')).toBe('Vendor One');
    expect(formData.get('WorkingHours[Monday]')).toBe('09:00-17:00');
  });

  it('sends profile picture changes to the dedicated endpoint', async () => {
    const request = mockApiResponse();
    const file = new File(['image'], 'profile.png', { type: 'image/png' });

    await updateVendorProfilePicture('vendor-1', file);

    const config = request.mock.calls[0][0];
    const formData = config.data as FormData;

    expect(config.method).toBe('PUT');
    expect(config.url).toBe('/VendorProfile/vendor-1/update-picture');
    expect(formData.get('profilePicture')).toBe(file);
  });
});

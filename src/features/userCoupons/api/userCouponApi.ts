import { apiClient } from '@/shared/api/client';
import type { GetUserCouponDto } from '../types';

export function getCouponByCode(code: string) {
  return apiClient<GetUserCouponDto>({ method: 'GET', url: `/UserCoupon/code/${encodeURIComponent(code)}` });
}

export interface RedeemCouponPayload {
  code: string;
  vendorId: string;
}

export function redeemCoupon(payload: RedeemCouponPayload) {
  return apiClient<GetUserCouponDto>({ method: 'POST', url: '/UserCoupon/redeem', data: payload });
}

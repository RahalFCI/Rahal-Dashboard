import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetCouponDto } from '../types';

export interface CreateCouponPayload {
  vendorId: string;
  title: string;
  description: string;
  xpCost: number;
  discountType: 'FixedAmount' | 'Percentage';
  discountValue: number;
  maxDiscountValue: number | null;
  minimumCharge: number;
  maxClaims: number;
  expiresAt: string;
  isActive: boolean;
}

export function createCoupon(payload: CreateCouponPayload) {
  return apiClient<GetCouponDto>({ method: 'POST', url: '/Coupon', data: payload });
}

export function listCoupons(page: number, pageSize: number) {
  return apiClient<PagedResult<GetCouponDto>>({
    method: 'GET',
    url: '/Coupon',
    params: { page, pageSize },
  });
}

export function getCouponById(id: string) {
  return apiClient<GetCouponDto>({ method: 'GET', url: `/Coupon/${id}` });
}

export function deleteCoupon(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/Coupon/${id}` });
}

export interface UpdateCouponPayload {
  title: string;
  description: string;
  xpCost: number;
  discountType: 'FixedAmount' | 'Percentage';
  discountValue: number;
  maxDiscountValue: number | null;
  minimumCharge: number;
  maxClaims: number;
  expiresAt: string;
  isActive: boolean;
}

export function updateCoupon(id: string, payload: UpdateCouponPayload) {
  return apiClient<GetCouponDto>({ method: 'PUT', url: `/Coupon/${id}`, data: payload });
}

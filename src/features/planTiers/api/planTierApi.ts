import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetPlanTierDto } from '../types';

export interface PlanTierPayload {
  name: string;
  description: string;
  weeklyPrice: number;
  weeklyXpCost: number;
  xpMultiplier: number;
  maxTravelPlans: number;
  isActive: boolean;
}

export function createPlanTier(payload: PlanTierPayload) {
  return apiClient<GetPlanTierDto>({ method: 'POST', url: '/PlanTier', data: payload });
}

export function updatePlanTier(id: string, payload: PlanTierPayload) {
  return apiClient<GetPlanTierDto>({ method: 'PUT', url: `/PlanTier/${id}`, data: payload });
}

export function listPlanTiers(page: number, pageSize: number) {
  return apiClient<PagedResult<GetPlanTierDto>>({
    method: 'GET',
    url: '/PlanTier',
    params: { page, pageSize },
  });
}

export function deletePlanTier(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/PlanTier/${id}` });
}

export function permanentDeletePlanTier(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/PlanTier/permanent/${id}` });
}

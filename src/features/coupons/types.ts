export interface GetCouponDto {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  xpCost: number;
  discountType: string;
  discountValue: number;
  maxDiscountValue: number | null;
  minimumCharge: number;
  maxClaims: number;
  currentClaims: number;
  remainingClaims: number;
  expiresAt: string;
  isActive: boolean;
}

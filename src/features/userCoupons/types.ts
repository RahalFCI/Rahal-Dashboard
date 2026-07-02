export interface GetUserCouponDto {
  id: string;
  explorerId: string;
  couponId: string;
  code: string;
  isRedeemed: boolean;
  status: string;
  claimedAt: string;
  redeemedAt: string | null;
  expiresAt: string;
  couponTitle: string;
}

export type PaymentStatus =
  | 'Pending'
  | 'RequiresPaymentMethod'
  | 'RequiresAction'
  | 'Processing'
  | 'Succeeded'
  | 'Failed'
  | 'Canceled';

export type PaymentGatewayType = 'Stripe';

export interface PaymentTransactionDto {
  transactionId: string;
  explorerId: string;
  explorerDisplayName: string;
  operationId: string;
  referenceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGatewayType;
  gatewayPaymentIntentId?: string | null;
  failureMessage?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PaymentTransactionFilters {
  explorerDisplayName?: string;
  status?: PaymentStatus;
  transactionId?: string;
  currency?: string;
  fromDate?: string;
  toDate?: string;
}

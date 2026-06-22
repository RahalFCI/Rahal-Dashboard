export interface GetXpTransactionDto {
  id: string;
  explorerId: string;
  amount: number;
  sourceType: string;
  referenceId: string | null;
  createdAt: string;
}

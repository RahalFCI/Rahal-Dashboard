import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { getXpTransactionsByExplorerId } from '../api/xpTransactionApi';

interface XpTransactionsDialogProps {
  explorerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function XpTransactionsDialog({ explorerId, open, onOpenChange }: XpTransactionsDialogProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a different explorer is opened, without an
  // effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop-change).
  const openKey = open ? explorerId : null;
  const [trackedKey, setTrackedKey] = useState<string | null>(null);
  if (openKey && openKey !== trackedKey) {
    setTrackedKey(openKey);
    setPage(1);
  }

  const transactionsQuery = useQuery({
    queryKey: ['xp-transactions', explorerId, page],
    queryFn: () => getXpTransactionsByExplorerId(explorerId!, page, 10),
    enabled: open && Boolean(explorerId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="XP transactions" description={explorerId ?? undefined}>
      {transactionsQuery.isLoading ? <LoadingState /> : null}
      {transactionsQuery.isError ? <ErrorState onRetry={() => void transactionsQuery.refetch()} /> : null}
      {transactionsQuery.data && transactionsQuery.data.items.length === 0 ? (
        <EmptyState title="No XP transactions" description="This explorer hasn't earned or spent any XP yet." />
      ) : null}
      {transactionsQuery.data && transactionsQuery.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-outline/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {transactionsQuery.data.items.map((tx) => (
                <tr key={tx.id} className="border-t border-outline/40">
                  <td className={`px-4 py-3 font-medium ${tx.amount < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{tx.sourceType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant" title={tx.referenceId ?? undefined}>
                    {tx.referenceId ? `${tx.referenceId.slice(0, 8)}…` : '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar page={page} result={transactionsQuery.data} onPageChange={setPage} />
        </div>
      ) : null}
    </Dialog>
  );
}

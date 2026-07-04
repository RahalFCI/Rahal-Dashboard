import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Panel } from '@/shared/components/ui/panel';
import { Select } from '@/shared/components/ui/select';
import { EmptyState, ErrorState, LoadingState } from '@/shared/layout/DataState';
import { PageHeader } from '@/shared/layout/PageHeader';
import { PaginationBar } from '@/shared/layout/PaginationBar';
import { listTransactions } from '../api/paymentsApi';
import { TransactionsTable } from '../components/TransactionsTable';
import type { PaymentStatus, PaymentTransactionFilters } from '../types';

const emptyFilters: PaymentTransactionFilters = {};

const statusOptions: PaymentStatus[] = [
  'Pending',
  'RequiresPaymentMethod',
  'RequiresAction',
  'Processing',
  'Succeeded',
  'Failed',
  'Canceled',
];

export function PaymentTransactionsPage() {
  // Draft filters track the raw form inputs; appliedFilters is what's actually
  // sent to the API. Keeping them separate means typing doesn't trigger a
  // request on every keystroke - only "Apply filters" (or Enter) does.
  const [draftFilters, setDraftFilters] = useState<PaymentTransactionFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<PaymentTransactionFilters>(emptyFilters);
  const [page, setPage] = useState(1);

  const transactionsQuery = useQuery({
    queryKey: ['payment-transactions', appliedFilters, page],
    queryFn: () => listTransactions(appliedFilters, page, 10),
  });

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  function resetFilters() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  const hasActiveFilters = Object.values(appliedFilters).some((value) => Boolean(value));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Payment transactions"
        description="Every payment processed through the gateway, with filtering by explorer, status, currency, and date range."
      />

      <Panel className="mb-4 p-4">
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <div>
            <Label htmlFor="explorerDisplayName">Explorer name</Label>
            <Input
              id="explorerDisplayName"
              placeholder="e.g. Jane Doe"
              value={draftFilters.explorerDisplayName ?? ''}
              onChange={(event) =>
                setDraftFilters((filters) => ({ ...filters, explorerDisplayName: event.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={draftFilters.status ?? ''}
              onChange={(event) =>
                setDraftFilters((filters) => ({
                  ...filters,
                  status: (event.target.value || undefined) as PaymentStatus | undefined,
                }))
              }
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="GUID"
              value={draftFilters.transactionId ?? ''}
              onChange={(event) => setDraftFilters((filters) => ({ ...filters, transactionId: event.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              placeholder="e.g. usd"
              value={draftFilters.currency ?? ''}
              onChange={(event) => setDraftFilters((filters) => ({ ...filters, currency: event.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="fromDate">From date</Label>
            <Input
              id="fromDate"
              type="date"
              value={draftFilters.fromDate ?? ''}
              onChange={(event) => setDraftFilters((filters) => ({ ...filters, fromDate: event.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="toDate">To date</Label>
            <Input
              id="toDate"
              type="date"
              value={draftFilters.toDate ?? ''}
              onChange={(event) => setDraftFilters((filters) => ({ ...filters, toDate: event.target.value }))}
            />
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="ghost" onClick={resetFilters} disabled={!hasActiveFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Panel>

      {transactionsQuery.isLoading ? <LoadingState /> : null}
      {transactionsQuery.isError ? <ErrorState onRetry={() => void transactionsQuery.refetch()} /> : null}
      {transactionsQuery.data?.items.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={
            hasActiveFilters
              ? 'No transactions match the current filters. Try widening your search.'
              : 'Payments will appear here once explorers start checking out.'
          }
        />
      ) : null}
      {transactionsQuery.data && transactionsQuery.data.items.length > 0 ? (
        <Panel className="overflow-hidden">
          <TransactionsTable transactions={transactionsQuery.data.items} />
          <PaginationBar page={page} result={transactionsQuery.data} onPageChange={setPage} />
        </Panel>
      ) : null}
    </>
  );
}

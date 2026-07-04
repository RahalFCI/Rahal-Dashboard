import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/badge';
import type { PaymentTransactionDto, PaymentStatus } from '../types';

interface TransactionsTableProps {
  transactions: PaymentTransactionDto[];
}

const statusBadgeClass: Record<PaymentStatus, string> = {
  Succeeded: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Canceled: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
  RequiresPaymentMethod: 'bg-amber-100 text-amber-700',
  RequiresAction: 'bg-amber-100 text-amber-700',
  Processing: 'bg-amber-100 text-amber-700',
};

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const columns: ColumnDef<PaymentTransactionDto>[] = [
    {
      header: 'Transaction',
      accessorKey: 'transactionId',
      cell: ({ row }) => (
        <span className="font-mono text-xs" title={row.original.transactionId}>
          {row.original.transactionId.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: 'Explorer',
      accessorKey: 'explorerDisplayName',
      cell: ({ row }) => <span className="font-medium text-on-surface">{row.original.explorerDisplayName}</span>,
    },
    {
      header: 'Amount',
      cell: ({ row }) => formatAmount(row.original.amount, row.original.currency),
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const { status, failureMessage } = row.original;
        return (
          <div>
            <Badge className={statusBadgeClass[status]}>{status}</Badge>
            {status === 'Failed' && failureMessage ? (
              <p className="mt-1 max-w-xs text-xs text-on-surface-variant">{failureMessage}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      header: 'Gateway',
      accessorKey: 'gateway',
      cell: ({ row }) => <Badge>{row.original.gateway}</Badge>,
    },
    {
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  const table = useReactTable({ data: transactions, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-semibold">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-outline/40">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Edit, KeyRound, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { UserSummaryDto } from '../types';

interface UserTableProps {
  users: UserSummaryDto[];
  onEdit?: (user: UserSummaryDto) => void;
  onPassword?: (user: UserSummaryDto) => void;
  onDelete?: (user: UserSummaryDto) => void;
  onRestore?: (user: UserSummaryDto) => void;
  includeDeleted?: boolean;
}

export function UserTable({ users, onEdit, onPassword, onDelete, onRestore, includeDeleted = false }: UserTableProps) {
  const hasActions = Boolean(onEdit || onPassword || onDelete || onRestore);
  const columns: ColumnDef<UserSummaryDto>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-on-surface">{row.original.name}</p>
          <p className="text-xs text-on-surface-variant">{row.original.email}</p>
        </div>
      ),
    },
    { header: 'Phone', accessorKey: 'phoneNumber' },
    {
      header: 'Role',
      cell: ({ row }) => <Badge>{String(row.original.role)}</Badge>,
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original;
        if ('isApproved' in user) return <Badge className={user.isApproved ? 'bg-green-100 text-green-700' : ''}>{user.isApproved ? 'Approved' : 'Pending'}</Badge>;
        if ('isPremium' in user) return <Badge>{user.isPremium ? 'Premium' : `Level ${user.level}`}</Badge>;
        return <Badge>Active</Badge>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        hasActions ? (
          <div className="flex justify-end gap-1">
            {onEdit ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Edit user" onClick={() => onEdit(row.original)}>
                <Edit size={16} />
              </Button>
            ) : null}
            {onPassword ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Update password"
                onClick={() => onPassword(row.original)}
              >
                <KeyRound size={16} />
              </Button>
            ) : null}
            {includeDeleted && onRestore ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Restore user" onClick={() => onRestore(row.original)}>
                <RotateCcw size={16} />
              </Button>
            ) : null}
            {!includeDeleted && onDelete ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Delete user" onClick={() => onDelete(row.original)}>
                <Trash2 size={16} />
              </Button>
            ) : null}
          </div>
        ) : null,
    },
  ];

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
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

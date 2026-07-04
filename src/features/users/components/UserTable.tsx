import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Edit, KeyRound, RotateCcw, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import type { UserSummaryDto } from '../types';

interface UserTableProps {
  users: UserSummaryDto[];
  currentUserId?: string;
  onEdit?: (user: UserSummaryDto) => void;
  onPassword?: (user: UserSummaryDto) => void;
  onDelete?: (user: UserSummaryDto) => void;
  onRestore?: (user: UserSummaryDto) => void;
  onPermanentDelete?: (user: UserSummaryDto) => void;
}

export function UserTable({ users, currentUserId, onEdit, onPassword, onDelete, onRestore, onPermanentDelete }: UserTableProps) {
  const hasActions = Boolean(onEdit || onPassword || onDelete || onRestore || onPermanentDelete);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserSummaryDto | null>(null);
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
        if (user.isDeleted) return <Badge className="bg-red-100 text-red-700">Deleted</Badge>;
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
            {row.original.isDeleted && onRestore ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Restore user" onClick={() => onRestore(row.original)}>
                <RotateCcw size={16} />
              </Button>
            ) : null}
            {!row.original.isDeleted && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete user"
                onClick={() => setConfirmDeleteUser(row.original)}
              >
                <Trash2 size={16} />
              </Button>
            ) : null}
            {onPermanentDelete && row.original.id === currentUserId ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Permanently delete your account"
                className="text-error hover:text-error"
                onClick={() => onPermanentDelete(row.original)}
              >
                <Trash size={16} />
              </Button>
            ) : null}
          </div>
        ) : null,
    },
  ];

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <>
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

      <ConfirmDialog
        open={confirmDeleteUser !== null}
        title={confirmDeleteUser ? `Delete ${confirmDeleteUser.name}?` : 'Delete user?'}
        description="This account can be restored later from the deleted-users view, so it isn't permanent, but the user will lose access immediately."
        onConfirm={() => {
          if (confirmDeleteUser) onDelete?.(confirmDeleteUser);
          setConfirmDeleteUser(null);
        }}
        onCancel={() => setConfirmDeleteUser(null)}
      />
    </>
  );
}

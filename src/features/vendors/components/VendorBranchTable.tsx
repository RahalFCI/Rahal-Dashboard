import { Edit, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import type { GetVendorBranchDto } from '../types';

interface VendorBranchTableProps {
  branches: GetVendorBranchDto[];
  onEdit?: (branch: GetVendorBranchDto) => void;
  onDelete?: (branch: GetVendorBranchDto) => void;
  onPhotos?: (branch: GetVendorBranchDto) => void;
}

export function VendorBranchTable({ branches, onEdit, onDelete, onPhotos }: VendorBranchTableProps) {
  const hasActions = Boolean(onEdit || onDelete || onPhotos);
  const [pendingDelete, setPendingDelete] = useState<GetVendorBranchDto | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
          <tr>
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Place</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id} className="border-t border-outline/40">
              <td className="px-4 py-3">
                <p className="font-medium">{branch.branchName}</p>
                <p className="line-clamp-1 text-xs text-on-surface-variant">{branch.notes}</p>
              </td>
              <td className="px-4 py-3">
                <p>{branch.placeName}</p>
                <p className="line-clamp-1 text-xs text-on-surface-variant">{branch.description}</p>
              </td>
              <td className="px-4 py-3">{branch.phoneNumber || '—'}</td>
              <td className="px-4 py-3 text-on-surface-variant">
                {branch.address?.city || 'Unknown'}, {branch.address?.country || 'Unknown'}
              </td>
              <td className="px-4 py-3">
                <Badge className={branch.isActive ? 'bg-green-100 text-green-700' : ''}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {hasActions ? (
                  <div className="flex justify-end gap-1">
                    {onPhotos ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Manage photos" onClick={() => onPhotos(branch)}>
                        <Image size={16} />
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Edit branch" onClick={() => onEdit(branch)}>
                        <Edit size={16} />
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Delete branch" onClick={() => setPendingDelete(branch)}>
                        <Trash2 size={16} />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.branchName}"?` : 'Delete branch?'}
        description="This cannot be undone. The branch and its place listing will be permanently removed."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete?.(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
